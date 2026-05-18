import { localApi, localExportUrl } from "./localApi.js";

const API_BASE = import.meta.env.VITE_API_URL || "";
const USE_STATIC_CRM = import.meta.env.VITE_STATIC_CRM === "true";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    let message = "No se pudo completar la operación.";
    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function withQuery(path, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

const remoteApi = {
  meta: () => request("/api/meta"),
  dashboard: () => request("/api/dashboard"),
  contacts: {
    list: (filters) => request(withQuery("/api/contacts", filters)),
    create: (data) => request("/api/contacts", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/contacts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/api/contacts/${id}`, { method: "DELETE" })
  },
  opportunities: {
    list: (filters) => request(withQuery("/api/opportunities", filters)),
    create: (data) => request("/api/opportunities", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/opportunities/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    updateStage: (id, stage) =>
      request(`/api/opportunities/${id}/stage`, { method: "PATCH", body: JSON.stringify({ stage }) }),
    remove: (id) => request(`/api/opportunities/${id}`, { method: "DELETE" })
  },
  tasks: {
    list: (filters) => request(withQuery("/api/tasks", filters)),
    create: (data) => request("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    updateStatus: (id, status) => request(`/api/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    remove: (id) => request(`/api/tasks/${id}`, { method: "DELETE" })
  },
  importCsv: (type, text) =>
    request(`/api/import/${type}`, {
      method: "POST",
      headers: { "Content-Type": "text/csv; charset=utf-8" },
      body: text
  })
};

export const api = USE_STATIC_CRM ? localApi : remoteApi;

export function exportUrl(type) {
  if (USE_STATIC_CRM) return localExportUrl(type);
  return `${API_BASE}/api/export/${type}`;
}
