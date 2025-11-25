const API_URL = "http://127.0.0.1:5000/api";

export async function fetchTransactions() {
  const res = await fetch(`${API_URL}/transactions`);
  return res.json();
}

export async function addTransaction(transaction) {
  const res = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
  return res.json();
}

export async function deleteTransaction(id) {
  const res = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function updateTransaction(id, updates) {
  const res = await fetch(`${API_URL}/transactions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}
export async function fetchHistory() {
  const res = await fetch("http://localhost:5000/api/history");
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function getOccupiedSlots() {
  const res = await fetch(`${API_URL}/parking/occupied`);
  if (!res.ok) throw new Error("Failed to fetch occupied slots");
  return res.json();
}


