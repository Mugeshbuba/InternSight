function Logo({size = 40}) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#8b7bb5"/>
      <circle cx="20" cy="16" r="7" fill="white" opacity="0.9"/>
      <path d="M10 32 Q20 24 30 32" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="20" cy="16" r="3" fill="#8b7bb5"/>
      <path d="M20 9 L22 14 L20 13 L18 14 Z" fill="white"/>
    </svg>
  )
}

export default Logo