interface Props {
  durationSeconds: number
  animationKey: string | number
}

export default function ProgressBar({ durationSeconds, animationKey }: Props) {
  return (
    <div className="h-[2px] w-full bg-border overflow-hidden relative shrink-0">
      <div
        key={animationKey}
        className="h-full bg-primary origin-left relative overflow-hidden"
        style={{ animation: `progressGrow ${durationSeconds}s linear forwards` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s ease-in-out infinite',
          }}
        />
      </div>

      <div
        key={`dot-${animationKey}`}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
        style={{ animation: `dotMove ${durationSeconds}s linear forwards` }}
      />

      <style>{`
        @keyframes progressGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes dotMove { from { left: 0%; } to { left: 100%; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  )
}
