export async function generateCards(formData) {
  const response = await fetch("http://127.0.0.1:8000/generate_cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await response.json();
  return data; // JSON.parse不要
}
