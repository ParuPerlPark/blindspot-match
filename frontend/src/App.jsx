import { useState } from "react";
import { generateCards } from "./generateCards";

export default function App() {
  const [currentRole, setCurrentRole] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [workStyle, setWorkStyle] = useState("");
  const [futureVision, setFutureVision] = useState("");
  const [noteUrl, setNoteUrl] = useState("");

  const [cards, setCards] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setStep(2);
    setLoading(true);

    const formData = {
      current_role: currentRole,
      strengths,
      weaknesses,
      work_style: workStyle,
      future_vision: futureVision,
      note_url: noteUrl,
    };

    const result = await generateCards(formData);
    console.log("RESULT:", result);
    setCards(result);
    setLoading(false);
    setStep(3);
  };

  const reset = () => {
    setCurrentRole("");
    setStrengths("");
    setWeaknesses("");
    setWorkStyle("");
    setFutureVision("");
    setNoteUrl("");
    setCards([]);
    setStep(1);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>BlindSpot Match - あなたの強みカード</h1>

      {step === 1 && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>あなたについて教えてください</h2>

          <label style={styles.label}>
            現在の職種
            <input
              style={styles.input}
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
            />
          </label>

          <label style={styles.label}>
            得意なこと
            <textarea
              style={styles.textarea}
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
            />
          </label>

          <label style={styles.label}>
            苦手なこと
            <textarea
              style={styles.textarea}
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
            />
          </label>

          <label style={styles.label}>
            好きな働き方
            <textarea
              style={styles.textarea}
              value={workStyle}
              onChange={(e) => setWorkStyle(e.target.value)}
            />
          </label>

          <label style={styles.label}>
            将来どうなりたい？
            <textarea
              style={styles.textarea}
              value={futureVision}
              onChange={(e) => setFutureVision(e.target.value)}
            />
          </label>

          <label style={styles.label}>
            noteのURL（任意）
            <input
              style={styles.input}
              value={noteUrl}
              onChange={(e) => setNoteUrl(e.target.value)}
              placeholder="https://note.com/xxxx"
            />
          </label>

          <button style={styles.button} onClick={handleAnalyze}>
            強みカードを生成する
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>AIが分析中…</p>
        </div>
      )}

      {step === 3 && (
        <div style={styles.resultArea}>
          <h2 style={styles.resultTitle}>あなたのキャリア手札</h2>

          <div style={styles.cardGrid}>
            {cards.map((c, i) => (
              <div key={i} style={{ ...styles.strengthCard, borderColor: c.color }}>
                <div style={styles.cardHeader}>
                  <span
                    style={{
                      ...styles.windowBadge,
                      background: c.window === "blindspot" ? "#EF4444" : "#3B82F6",
                    }}
                  >
                    {c.window === "blindspot" ? "盲点の窓" : "開放の窓"}
                  </span>
                  <span style={styles.sourceBadge}>
                    {c.source === "note" ? "from note" : "from Q&A"}
                  </span>
                </div>

                <h3 style={{ ...styles.cardTitle, color: c.color }}>{c.title}</h3>
                <p style={styles.cardDesc}>{c.description}</p>

                <div style={styles.tagArea}>
                  {c.tags.map((tag, j) => (
                    <span key={j} style={{ ...styles.tag, background: c.color }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {c.reason && <p style={styles.reasonText}>📝 {c.reason}</p>}
              </div>
            ))}
          </div>

          <button style={{ ...styles.button, marginTop: "30px" }} onClick={reset}>
            もう一度診断する
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "30px",
    fontWeight: "bold",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    marginBottom: "12px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginTop: "4px",
    marginBottom: "8px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    minHeight: "80px",
    padding: "8px",
    marginTop: "4px",
    marginBottom: "8px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "vertical",
  },
  button: {
    width: "100%",
    padding: "12px",
    fontSize: "18px",
    background: "#4A90E2",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  loadingCard: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  loadingText: {
    marginTop: "20px",
    fontSize: "18px",
    color: "#555",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "6px solid #eee",
    borderTop: "6px solid #4A90E2",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  resultArea: {
    textAlign: "center",
  },
  resultTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },
  strengthCard: {
    background: "#fff",
    border: "3px solid",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  windowBadge: {
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  sourceBadge: {
    fontSize: "11px",
    color: "#666",
    padding: "2px 6px",
    borderRadius: "999px",
    border: "1px solid #ddd",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  cardDesc: {
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "10px",
  },
  tagArea: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    justifyContent: "center",
    marginBottom: "8px",
  },
  tag: {
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
  },
  reasonText: {
    fontSize: "12px",
    color: "#555",
    marginTop: "6px",
  },
};

const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`);
