import { useState, useEffect } from 'react'
import { useSuperProductivity, SP_BASE } from '../hooks/useSuperProductivity'

export function Diagnostics() {
  const spState = useSuperProductivity()
  const [sseStatus, setSseStatus] = useState<string>('Checking...')
  const [apiChecks, setApiChecks] = useState<Record<string, { ok: boolean; message: string }>>({})

  useEffect(() => {
    // Check if SSE endpoint is reachable
    const checkSSE = () => {
      const es = new EventSource(`${SP_BASE}/events`)
      
      const timeout = setTimeout(() => {
        setSseStatus('❌ Timeout - SP REST API not responding')
        es.close()
      }, 5000)

      es.onopen = () => {
        clearTimeout(timeout)
        setSseStatus('✅ SSE Connected')
        es.close()
      }

      es.onerror = () => {
        clearTimeout(timeout)
        setSseStatus('❌ SSE Failed - Check if SP REST API is enabled')
        es.close()
      }
    }

    checkSSE()

    // Check all endpoints
    const endpoints = [
      { name: 'health', path: `${SP_BASE}/health` },
      { name: 'task-control/current', path: `${SP_BASE}/task-control/current` },
      { name: 'focus-mode', path: `${SP_BASE}/focus-mode` },
      { name: 'stats/today', path: `${SP_BASE}/stats/today` },
      { name: 'projects', path: `${SP_BASE}/projects` },
      { name: 'events', path: `${SP_BASE}/events` },
    ]

    endpoints.forEach(async ({ name, path }) => {
      try {
        const res = await fetch(path)
        if (!res.ok) {
          setApiChecks(prev => ({
            ...prev,
            [name]: { ok: false, message: `HTTP ${res.status}` }
          }))
          return
        }
        const json = await res.json()
        setApiChecks(prev => ({
          ...prev,
          [name]: { 
            ok: json.ok === true, 
            message: json.ok ? '✅ OK' : `❌ ${json.error?.code || 'Error'}` 
          }
        }))
      } catch (error) {
        setApiChecks(prev => ({
          ...prev,
          [name]: { 
            ok: false, 
            message: `❌ ${error instanceof Error ? error.message : 'Failed'}` 
          }
        }))
      }
    })
  }, [])

  return (
    <div style={{
      padding: '40px',
      maxWidth: '900px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      color: '#ffffff',
      background: '#0a0a0f',
      minHeight: '100vh',
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px', fontWeight: 700 }}>
        🔍 Super Productivity Overlay Diagnostics
      </h1>

      {/* Connection Status */}
      <section style={{ 
        marginBottom: '32px',
        padding: '20px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600 }}>Connection Status</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StatusRow 
            label="Hook Status" 
            value={spState.connectionStatus} 
            isGood={spState.connectionStatus === 'connected'} 
          />
          <StatusRow 
            label="SSE Endpoint" 
            value={sseStatus} 
            isGood={sseStatus.includes('✅')} 
          />
        </div>
      </section>

      {/* API Endpoints */}
      <section style={{ 
        marginBottom: '32px',
        padding: '20px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600 }}>API Endpoints</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(apiChecks).map(([name, check]) => (
            <StatusRow 
              key={name}
              label={name} 
              value={check.message} 
              isGood={check.ok} 
            />
          ))}
        </div>
      </section>

      {/* Current Data */}
      <section style={{ 
        marginBottom: '32px',
        padding: '20px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600 }}>Current Data</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DataRow label="Current Task" value={spState.currentTask?.title || 'None'} />
          <DataRow label="Focus Mode Running" value={spState.focusMode?.isRunning ? 'Yes' : 'No'} />
          <DataRow label="Projects Loaded" value={spState.projects.length.toString()} />
          <DataRow label="Today Tasks" value={spState.todayTasks.length.toString()} />
          <DataRow 
            label="Time Spent Today" 
            value={spState.todayStats ? formatMs(spState.todayStats.timeSpentToday) : 'N/A'} 
          />
          <DataRow 
            label="Completed Today" 
            value={spState.todayStats?.completedToday.toString() || 'N/A'} 
          />
        </div>
      </section>

      {/* Today's Tasks List */}
      {spState.todayTasks.length > 0 && (
        <section style={{ 
          marginBottom: '32px',
          padding: '20px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600 }}>
            Today's Tasks ({spState.todayTasks.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {spState.todayTasks.map(task => (
              <div key={task.id} style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span style={{
                  fontSize: '16px',
                  opacity: task.isDone ? 0.5 : 1,
                  textDecoration: task.isDone ? 'line-through' : 'none',
                }}>
                  {task.isDone ? '✅' : '⬜'} {task.title}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  marginLeft: 'auto',
                }}>
                  {formatMs(task.timeSpent)}
                  {task.timeEstimate > 0 && ` / ${formatMs(task.timeEstimate)}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Setup Instructions */}
      <section style={{ 
        padding: '20px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600, color: '#60a5fa' }}>
          Setup Instructions
        </h2>
        <ol style={{ 
          margin: 0, 
          paddingLeft: '24px', 
          lineHeight: '1.8',
          color: 'rgba(255,255,255,0.8)',
        }}>
          <li>Start Super Productivity's Angular frontend: <code style={codeStyle}>npm run startFrontend</code></li>
          <li>Wait for "✔ Compiled successfully"</li>
          <li>Start the Electron app: <code style={codeStyle}>npm start</code></li>
          <li>In Super Productivity: <strong>Settings → Misc → Enable "Local REST API"</strong></li>
          <li>Refresh this page to see the connection status</li>
        </ol>
      </section>
    </div>
  )
}

function StatusRow({ label, value, isGood }: { label: string; value: string; isGood: boolean }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '6px',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
      <span style={{ 
        fontWeight: 600,
        color: isGood ? '#22c55e' : '#ef4444',
      }}>
        {value}
      </span>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '6px',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
      <span style={{ fontWeight: 500, color: '#ffffff' }}>{value}</span>
    </div>
  )
}

function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const codeStyle: React.CSSProperties = {
  padding: '2px 8px',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '4px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '13px',
  color: '#60a5fa',
}
