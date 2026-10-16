export async function analyzeCandidate(text) {
  const res = await fetch("http://127.0.0.1:8000/candidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  return data.result;
}
