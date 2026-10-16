export default function Report({ content }) {
  if (!content) return null;

  return (
    <div style={{
      background: "#fff",
      padding: "24px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      whiteSpace: "pre-wrap",
      lineHeight: "1.7",
      fontSize: "16px"
    }}>
      <h2 style={{ marginBottom: "16px" }}>🔍 あなたがまだ知らないあなた</h2>
      {content}
    </div>
  );
}
