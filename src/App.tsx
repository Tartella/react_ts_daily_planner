import React, { useEffect, useMemo, useState } from 'react'
import type { Task } from './types'

type Filter = 'all' | 'active' | 'completed'

const STORAGE_KEY = 'react-ts-daily-planner/tasks'

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Task[]) : []
    } catch {
      return []
    }
  })
  const [filter, setFilter] = useState<Filter>('all')

  // form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: t,
      description: description.trim(),
      dueDate: dueDate || undefined,
      isCompleted: false,
    }
    setTasks((prev) => [...prev, newTask])
    setTitle('')
    setDescription('')
    setDueDate('')
  }

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((x) => (x.id === id ? { ...x, isCompleted: !x.isCompleted } : x)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((x) => x.id !== id))
  }

  const filtered = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter((t) => !t.isCompleted)
      case 'completed':
        return tasks.filter((t) => t.isCompleted)
      default:
        return tasks
    }
  }, [tasks, filter])

  return (
    <div className="app">
      <h1>Ежедневник</h1>

      <form className="task-form" onSubmit={addTask}>
        <input
          type="text"
          placeholder="Название задачи (обязательно)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Описание (необязательно)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button type="submit">Добавить</button>
      </form>

      <div className="filters">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>Все</button>
        <button onClick={() => setFilter('active')} className={filter === 'active' ? 'active' : ''}>Активные</button>
        <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>Завершённые</button>
      </div>

      <ul className="task-list">
        {filtered.map((t) => (
          <li key={t.id} className={t.isCompleted ? 'completed' : ''}>
            <div className="task-row">
              <div className="task-main">
                <input
                  type="checkbox"
                  checked={t.isCompleted}
                  onChange={() => toggleTask(t.id)}
                  aria-label="Отметить выполнение"
                />
                <div className="task-text">
                  <h3>{t.title}</h3>
                  {t.description && <p>{t.description}</p>}
                </div>
              </div>
              <div className="task-meta">
                {t.dueDate && <span className="date">{t.dueDate}</span>}
                <button className="delete" onClick={() => deleteTask(t.id)}>Удалить</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
