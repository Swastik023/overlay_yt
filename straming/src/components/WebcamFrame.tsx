export function WebcamFrame() {
  return (
    <div className="flex flex-col gap-2 flex-1">
      {/* LIVE indicator with golden glow */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(250,204,21,0.2), rgba(249,115,22,0.15))' }}>
        <div className="live-dot" style={{ width: '6px', height: '6px' }} />
        <span className="text-[10px] font-bold tracking-widest" style={{ color: '#ef4444' }}>
          WEBCAM
        </span>
      </div>

      {/* Webcam frame - SQUARE and larger */}
      <div
        className="relative overflow-hidden rounded-xl flex-1"
        style={{
          width: '100%',
          minHeight: '250px',
          background: 'rgba(0,0,0,0.6)',
          border: '2px solid var(--accent-yellow)',
          boxShadow: '0 0 20px rgba(250,204,21,0.25), inset 0 0 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Golden gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(250,204,21,0.05), transparent)',
          }}
        />

        {/* Placeholder */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(250,204,21,0.1)',
              border: '2px solid rgba(250,204,21,0.3)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(250,204,21,0.5)" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <span className="text-[10px] font-medium" style={{ color: 'rgba(250,204,21,0.4)' }}>
            OBS Webcam
          </span>
        </div>

        {/* Corner accents */}
        {[
          'top-1 left-1 border-t-2 border-l-2',
          'top-1 right-1 border-t-2 border-r-2',
          'bottom-1 left-1 border-b-2 border-l-2',
          'bottom-1 right-1 border-b-2 border-r-2',
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 ${cls}`}
            style={{ borderColor: 'var(--accent-yellow)' }}
          />
        ))}
      </div>
    </div>
  )
}
