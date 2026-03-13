const BASE = "http://localhost:5000/api";

async function req(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  post:   (path, body, token) => req("POST",   path, body, token),
  get:    (path, token)       => req("GET",    path, null, token),
  delete: (path, token)       => req("DELETE", path, null, token),
};
