import { useState } from "react";
import { login, signup } from "../api/auth.js";
import { createSocket } from "../socket/socket.js";
import { ShipWheelIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRoom } from "../context/RoomContext.jsx";

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const { loadRooms, setToken } = useRoom();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      let token, user;
      if (isSignup) {
        // 🔹 Signup using helper
        ({ token, user } = await signup({ name, email, password }));
      } else {
        // 🔹 Login using helper
        ({ token, user } = await login({ email, password }));
      }
      toast.success((isSignup ? "Signup" : "Login") + " successful!");

      // 🔹 Save session data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      const socket = createSocket(token);

      socket.auth = { token };
      setToken(token);
      socket.connect();
      console.log("socket.connect(); called");
      loadRooms(token);
      console.log("called load rooms");
      // 🔹 Callback to parent
      onLogin(user);
    } catch (error) {
      console.error("in Login line 40", error);
      setError(error.message);
    }
  }
  return (
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-base-200 ">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-3xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* LEFT: FORM */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col">
          <div className="mb-6 flex items-center gap-2">
            <ShipWheelIcon className="w-9 h-9 text-primary" />
            <h1 className="text-4xl font-bold font-mono bg-linear-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
              Chat App
            </h1>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <h2 className="text-xl font-semibold mb-2">
            {isSignup ? "Create an Account" : "Login"}
          </h2>
          <p className="text-sm opacity-70 mb-4">
            {isSignup
              ? "Join Streamify and start your language learning adventure!"
              : "Welcome back! Please login to continue."}
          </p>

          <form
            onSubmit={(e) =>
              handleSubmit(e, { name, email, password }, setIsPending, setError)
            }
            className="space-y-4"
          >
            {isSignup && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Display Name</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input input-bordered w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="john@gmail.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="********"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-outline btn-primary w-full flex items-center justify-center gap-2"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Loading...
                </>
              ) : isSignup ? (
                "Sign Up"
              ) : (
                "Login"
              )}
            </button>

            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setIsSignup((prev) => !prev)}
                className="text-sm text-primary hover:underline"
              >
                {isSignup
                  ? "Already have an account? Login"
                  : "Create new account"}
              </button>
            </div>
          </form>
        </div>
        {/* RIGHT: Illustration / Info */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8 text-center">
            <img
              src="/chat.svg"
              alt="Language connection"
              className="w-full h-full object-contain"
            />
            <h2 className="text-xl font-semibold mt-6">
              Chat with anyone, anywhere!
            </h2>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
