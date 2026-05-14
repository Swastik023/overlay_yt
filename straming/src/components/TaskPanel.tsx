import { useState, useRef, useEffect } from 'react'
import { Plus, GripVertical, Trash2, Edit2, Check, X } from 'lucide-react'
import { useStore } from '../store/useStore'

export function TaskPanel() {
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const toggleTask = useStore((s) => s.toggleTask)
  const removeTask = useStore((s) => s.removeTask)
  const updateTask = useStore((s) => s.updateTask)

  const [newTask, setNewTask] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const editRef = useRef<HTMLInputElement>(null)

  const completed = tasks.filter((t) => t.completed).length

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdding])

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus()
      editRef.current.select()
    }
  }, [editingId])

  const handleAdd = () => {
    if (newTask.trim()) {
      addTask(newTask.trim())
      setNewTask('')
      setIsAdding(false)
    }
  }

  const startEdit = (id: string, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      updateTask(editingId, editText.trim())
      setEditingId(null)
      setEditText('')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleDelete = (id: string) => {
    removeTask(id)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--accent-yellow)' }}>
          TASKS
        </span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150"
          style={{ background: 'rgba(250,204,21,0.15)', color: 'var(--accent-yellow)' }}
          title="Add new task"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Add Task Input */}
      {isAdding && (
        <div className="flex gap-1.5">
          <input
            ref={inputRef}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') setIsAdding(false)
            }}
            placeholder="Add a task..."
            className="flex-1 px-2.5 py-1.5 rounded-lg text-xs outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(250,204,21,0.3)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      )}

      {/* Task List */}
      <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1 task-list" style={{ scrollbarWidth: 'thin' }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0"
              style={{
                borderColor: task.completed ? 'var(--accent-yellow)' : 'rgba(255,255,255,0.3)',
                background: task.completed ? 'var(--accent-yellow)' : 'transparent',
              }}
              title="Toggle complete"
            >
              {task.completed && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {editingId === task.id ? (
              <>
                <input
                  ref={editRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  className="flex-1 px-2 py-0.5 rounded text-sm outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(250,204,21,0.5)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  onClick={saveEdit}
                  className="flex-shrink-0 transition-colors"
                  style={{ color: 'var(--accent-yellow)' }}
                  title="Save (Enter)"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-shrink-0 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  title="Cancel (Esc)"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <span
                  className="flex-1 text-sm font-medium truncate cursor-pointer"
                  style={{
                    color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}
                  onDoubleClick={() => startEdit(task.id, task.text)}
                  title="Double-click to edit"
                >
                  {task.text}
                </span>

                <button
                  onClick={() => startEdit(task.id, task.text)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--accent-yellow)' }}
                  title="Edit task"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#ef4444' }}
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>

                <GripVertical size={14} style={{ color: 'rgba(255,255,255,0.3)' }} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </>
            )}
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-4">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No tasks yet. Click + to add one!
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>
            PROGRESS
          </span>
          <span className="text-sm font-bold mono" style={{ color: 'var(--accent-yellow)' }}>
            {completed} / {tasks.length}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              background: 'var(--accent-yellow)',
              width: tasks.length > 0 ? `${(completed / tasks.length) * 100}%` : '0%',
              boxShadow: '0 0 8px rgba(250,204,21,0.6)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
