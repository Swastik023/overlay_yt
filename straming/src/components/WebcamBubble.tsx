export function WebcamBubble() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <div className="webcam-frame">
        {/* Placeholder — OBS webcam source goes here */}
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(250,204,21,0.2)" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
      </div>
      <span style={{ fontSize: '6px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', opacity: 0.4 }}>CAM</span>
    </div>
  )
}
