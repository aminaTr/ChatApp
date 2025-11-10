const backendUrl = (import.meta.env.VITE_SOCKET_URL ||"http://localhost:5000")+"/api";

export async function login({ email, password }) {
  console.log(backendUrl)
  const res = await fetch(backendUrl+"/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json(); // { token, user }
}

export async function signup({ name, email, password }) {
  const res = await fetch(backendUrl+"/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName:name, email, password }),
  });
  return res.json(); // { token, user }
}
