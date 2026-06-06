export function SplashScreen() {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 100,
      background: "linear-gradient(135deg, #9FE870 0%, #B6F088 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: "0px",
      animation: "splashOut 0.5s ease 2.0s forwards",
    }}>
      <style>{`
        @keyframes splashOut {
          from { opacity: 1; }
          to   { opacity: 0; pointer-events: none; }
        }
        @keyframes splashUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashPulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Logo mark */}
      <div style={{ animation: "splashUp 0.5s ease 0.1s both", marginBottom: "20px" }}>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ animation: "splashPulse 1.2s ease 0.6s" }}>
          <rect width="72" height="72" rx="20" fill="#163300" />
          {/* Card stack suggestion */}
          <rect x="16" y="28" width="40" height="26" rx="5" fill="none" stroke="#9FE870" strokeWidth="2" opacity="0.4" />
          <rect x="16" y="22" width="40" height="26" rx="5" fill="#9FE870" />
          {/* Magnetic stripe */}
          <rect x="16" y="28" width="40" height="6" fill="#163300" opacity="0.25" />
          {/* Renewal arrow */}
          <path
            d="M30 40 Q36 34 42 40"
            stroke="#163300" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"
          />
          <polyline points="40,38 42,40 40,42" stroke="#163300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        </svg>
      </div>

      {/* App name */}
      <p style={{
        animation: "splashUp 0.5s ease 0.3s both",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "36px", fontWeight: 800, letterSpacing: "-0.02em",
        color: "#163300", lineHeight: 1, margin: 0,
      }}>
        Subtrack
      </p>

      {/* Tagline */}
      <p style={{
        animation: "splashUp 0.5s ease 0.5s both",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px", fontWeight: 500,
        color: "#163300", opacity: 0.55,
        marginTop: "8px", letterSpacing: "0.02em",
      }}>
        Know what you pay.
      </p>
    </div>
  );
}
