export default function AdminLoading() {
  return (
    <div style={{ background: "#F4F5F7", minHeight: "100vh" }}>
      <header style={{ background: "#161616", height: 62 }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 28 }} className="admin-kpis">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: 14, padding: "16px 18px", height: 74 }}>
              <div style={{ width: "40%", height: 20, borderRadius: 6, background: "#F0F0F0", marginBottom: 10, animation: "admin-pulse 1.4s ease-in-out infinite" }} />
              <div style={{ width: "70%", height: 10, borderRadius: 6, background: "#F4F4F4", animation: "admin-pulse 1.4s ease-in-out infinite" }} />
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: 16, padding: 48 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 16, borderRadius: 6, background: "#F0F0F0", marginBottom: 18, width: `${90 - i * 12}%`, animation: "admin-pulse 1.4s ease-in-out infinite" }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes admin-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 900px) { .admin-kpis { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 560px) { .admin-kpis { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}
