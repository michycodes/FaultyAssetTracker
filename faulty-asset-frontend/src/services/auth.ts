import api from "./api";

type JwtPayload = {
  email?: string;
  unique_name?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
};

export async function login(email: string, password: string) {
  const response = await api.post(
    `/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
  );

  const token = response.data?.token as string;

  if (!token) {
    throw new Error("No token returned from backend.");
  }

  localStorage.setItem("token", token);
  return token;
}

export async function changeDisplayName(newName: string) {
  const response = await api.put("/auth/change-name", {
    newName,
  });

  const token = response.data?.token as string | undefined;
  if (token) {
    localStorage.setItem("token", token);
  }

  return response.data;
}

export function logout() {
  localStorage.removeItem("token");
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}

export function getToken() {
  return localStorage.getItem("token");
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payloadJson = atob(padded);
    return JSON.parse(payloadJson) as JwtPayload;
  } catch {
    return null;
  }
}

export function getUserRoles() {
  const token = getToken();
  if (!token) {
    return [] as string[];
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return [] as string[];
  }

  const roleClaim = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  if (Array.isArray(roleClaim)) {
    return roleClaim;
  }

  if (typeof roleClaim === "string") {
    return [roleClaim];
  }

  return [] as string[];
}

export function getDisplayUser() {
  const token = getToken();
  if (!token) {
    return "";
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return "";
  }

  return (
    payload.unique_name ||
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
    payload.email ||
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
    ""
  );
}
