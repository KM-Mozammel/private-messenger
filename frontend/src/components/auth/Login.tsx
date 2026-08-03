import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { User } from "../../types/models";

type Props = {
  onLogin: (user: User) => void;
};

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [failedLoginAttempt, setFailedLoginAttempt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) return;

    try {
      const user = await api.login(username);

      if (!user) {
        setFailedLoginAttempt(true);
        return;
      }

      setFailedLoginAttempt(false);
      onLogin(user);
    } catch (error: any) {
      if (error?.response) {
        console.log("HTTP Status:", error.response.status);
        console.log("Response Headers:", error.response.headers);
        console.log("Response Data:", error.response.data);
      }

      if (error?.request) {
        console.log("Request:", error.request);
      }

      setFailedLoginAttempt(true);
    }
  };

  return (
    <div className="flex h-screen items-start justify-center pt-50 bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow dark:bg-gray-800"
      >
        <div className="mb-4 flex flex-col items-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
            {/* Chat bubble logo */}
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="rgba(255,255,255,0.95)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="white" />
              <path d="M7 8h10M7 12h6" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-100">
            Private Login
          </h1>
        </div>

        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setFailedLoginAttempt(false);
          }}
          className="mb-4 w-full rounded border px-3 py-2 outline-none focus:ring text-center"
        />

        {failedLoginAttempt && (
          <p className="mb-4 text-sm font-semibold text-center px-2 py-1 bg-red-500/10 text-red-600 rounded" role="alert" aria-live="polite">
            Login Failed, Try Again.
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!username.trim()}
        >
          Continue
        </button>
      </form>
    </div>
  );
}
