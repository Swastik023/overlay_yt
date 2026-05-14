import { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../store/useStore'

export function TaskModule() {
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const toggleTask = useStore((s) => s.toggleTask)
  const [newTask, setNewTask] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const completed = tasks.filter((t) => t.completed).length

  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus()
  }, [isAdding])

  const handleAdd = () => {
    if (newTask.trim()) { addTask(newTask.trim()); setNewTask(''); setIsAdding(false) }
  }

  return (
    <div className="floating-module rail-module">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="rail-module-label" style={{ marginBottom: 0 }}>TASKS</div>
        <button onClick={() => setIsAdding(!isAdding)} style={{
          width: '14px', height: '14px', borderRadius: '3px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(250,204,21,0.06)', color: 'var(--accent-yellow)',
          border: 'none', cursor: 'pointer',
        }} title="Add task">
          <Plus size={8} />
        </button>
      </div>

      {isAdding && (
        <input ref={inputRef} value={newTask} onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setIsAdding(false) }}
          placeholder="New task..." style={{
            width: '100%', padding: '2px 5px', borderRadius: '4px', fontSize: '8px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(250,204,21,0.1)',
            color: 'var(--text-primary)', outline: 'none', marginTop: '3px',
          }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '3px' }}>
        {tasks.slice(0, 4).map((task) => (
          <div key={task.id} className="task-item-compact">
            <button onClick={() => toggleTask(task.id)} className={`task-checkbox-mini ${task.completed ? 'checked' : ''}`}>
              {task.completed && <svg width="6" height="6" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
            <span style={{
              fontSize: 'clamp(7px, 0.5vw, 9px)', fontWeight: 500,
              color: task.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
              textDecoration: task.completed ? 'line-through' : 'none',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2,
            }}>{task.text}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
          <span style={{ fontSize: '6px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>PROGRESS</span>
          <span className="mono" style={{ fontSize: '7px', color: 'var(--accent-yellow)', fontWeight: 700 }}>{completed}/{tasks.length}</span>
        </div>
        <div style={{ height: '2px', borderRadius: '1px', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '1px', background: 'var(--accent-yellow)',
            width: tasks.length > 0 ? `${(completed / tasks.length) * 100}%` : '0%',
            transition: 'width 0.5s ease',
            boxShadow: '0 0 4px rgba(250,204,21,0.2)',
          }} />
        </div>
      </div>
    </div>
  )
}
