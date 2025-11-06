export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sessionId");
}

export function setSessionId(id: string) {
  localStorage.setItem("sessionId", id);
}

export function clearSession() {
  localStorage.removeItem("sessionId");
}
