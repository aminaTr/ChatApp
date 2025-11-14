const backendUrl = (import.meta.env.VITE_SOCKET_URL ||"http://localhost:5000")+"/api";

export async function login({ email, password }) {
  try {
    console.log('backendUrl', backendUrl)
    const res = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Handle invalid credentials
      throw new Error(data.error || "Invalid email or password");
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}


export async function signup({ name, email, password }) {
  try {
    const res = await fetch(backendUrl+"/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName:name, email, password }),
    });
    const data = await res.json(); // { token, user }
    if (!res.ok) {
      console.log(data.error)
      throw new Error(data.error || "Invalid email or password");
    }
    return data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}
