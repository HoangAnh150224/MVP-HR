const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    const msg =
      body && typeof body === "object" && "error" in body
        ? (body as { error: { message?: string } }).error?.message ??
          `API Error: ${status}`
        : `API Error: ${status}`;
    super(msg);
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, await res.json());
  }

  return res.json();
}

async function uploadWithAuth(url: string, file: File, fields: Record<string, string> = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const formData = new FormData();
  formData.append("file", file);
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new ApiError(res.status, await res.json());
  }

  return res.json();
}

export const api = {
  get: (url: string) => fetchWithAuth(url),
  post: (url: string, body: unknown) =>
    fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) }),
  patch: (url: string, body: unknown) =>
    fetchWithAuth(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (url: string) => fetchWithAuth(url, { method: "DELETE" }),
  upload: (url: string, file: File, fields?: Record<string, string>) =>
    uploadWithAuth(url, file, fields),
};
