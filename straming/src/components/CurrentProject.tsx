import { useState } from 'react'
import { Code2, Edit3 } from 'lucide-react'

export function CurrentProject() {
  const [project, setProject] = useState('AI Chat Application')
  const [isEditing, setIsEditing] = useState(false)
  const [tempProject, setTempProject] = useState(project)

  const handleSave = () => {
    setProject(tempProject)
    setIsEditing(false)
    localStorage.setItem('currentProject', tempProject)
  }

  const handleCancel = () => {
    setTempProject(project)
    setIsEditing(false)
  }

  // Load from localStorage on mount
  useState(() => {
    const saved = localStorage.getItem('currentProject')
    if (saved) {
      setProject(saved)
      setTempProject(saved)
    }
  })

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
      style={{
        background: 'rgba(250, 204, 21, 0.08)',
        border: '1px solid rgba(250, 204, 21, 0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Code2 size={18} style={{ color: 'var(--accent-yellow)' }} />
      
      {!isEditing ? (
        <>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="section-label" style={{ fontSize: '9px', color: 'var(--accent-yellow)' }}>
              BUILDING
            </span>
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {project}
            </span>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
            title="Edit project"
          >
            <Edit3 size={12} />
          </button>
        </>
      ) : (
        <>
          <input
            value={tempProject}
            onChange={(e) => setTempProject(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') handleCancel()
            }}
            className="flex-1 px-2 py-1 rounded text-sm outline-none"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(250,204,21,0.3)',
              color: 'var(--text-primary)',
            }}
            autoFocus
          />
          <button
            onClick={handleSave}
            className="px-2 py-1 rounded text-xs font-semibold"
            style={{ background: 'var(--accent-yellow)', color: '#0a0a0f' }}
          >
            Save
          </button>
        </>
      )}
    </div>
  )
}
