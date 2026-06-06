export function SplashScreen() {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 100,
      background: "linear-gradient(135deg, #9FE870 0%, #B6F088 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: "splashOut 0.45s ease 2.05s forwards",
    }}>
      <style>{`
        @keyframes splashOut {
          from { opacity: 1; }
          to   { opacity: 0; pointer-events: none; }
        }
        @keyframes splashUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashScale {
          from { opacity: 0; transform: scale(0.82); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Logo mark */}
      <div style={{ animation: "splashScale 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.05s both", marginBottom: "22px" }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect width="80" height="80" rx="22" fill="#163300"/>
          {/* Top pill — full width: primary subscription */}
          <rect x="16" y="20" width="48" height="11" rx="5.5" fill="#9FE870"/>
          {/* Middle pill — slightly shorter */}
          <rect x="16" y="36" width="48" height="11" rx="5.5" fill="#9FE870" opacity="0.55"/>
          {/* Bottom pill — shortest, trailing off */}
          <rect x="16" y="52" width="32" height="11" rx="5.5" fill="#9FE870" opacity="0.25"/>
          {/* Recurring arrow — bottom right corner */}
          <path
            d="M 62 57 A 7 7 0 1 1 55 64"
            stroke="#9FE870" strokeWidth="2.5" strokeLinecap="round" fill="none"
          />
          <path
            d="M 52 61 L 55 64 L 58 61"
            stroke="#9FE870" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
          />
        </svg>
      </div>

      {/* App name */}
      <p style={{
        animation: "splashUp 0.45s ease 0.25s both",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "38px", fontWeight: 800, letterSpacing: "-0.03em",
        color: "#163300", lineHeight: 1, margin: 0,
      }}>
        Subtrack
      </p>

      {/* Tagline */}
      <p style={{
        animation: "splashUp 0.45s ease 0.42s both",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px", fontWeight: 500,
        color: "#163300", opacity: 0.5,
        marginTop: "8px", letterSpacing: "0.03em",
      }}>
        Know what you pay.
      </p>
    </div>
  );
}
