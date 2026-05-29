const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("accessToken");

  let apiResponse;

  try {
    apiResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });
  } catch {
    return {
      error: true,
      message: "Tidak dapat terhubung ke server. Coba lagi nanti.",
    };
  }

  const result = await apiResponse.json().catch(() => ({
    message: "Response server tidak valid.",
  }));

  if (!apiResponse.ok) {
    return {
      error: true,
      message: result.message || "Terjadi kesalahan pada server.",
    };
  }

  return {
    error: false,
    data: result.data,
    message: result.message,
  };
}

export function getActivities({ limit = 20, offset = 0 } = {}) {
  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  return request(`/activities?${searchParams.toString()}`);
}

export function createActivity(activity) {
  return request("/activities", {
    method: "POST",
    body: JSON.stringify(activity),
  });
}
