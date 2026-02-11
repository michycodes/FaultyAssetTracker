import api from "./api";

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

export function logout() {
  localStorage.removeItem("token");
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}
