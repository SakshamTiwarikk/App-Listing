"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1950&q=80')",
      }}
    >
      <div className="bg-black bg-opacity-60 p-10 rounded-lg text-white text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">Welcome to Listing App</h1>
        <p className="mb-6 text-lg">
          Start by registering your account to list and manage your items.
        </p>
        <button
          onClick={() => router.push("/register")}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-semibold transition duration-300"
        >
          Go to Register
        </button>
      </div>
    </div>
  );
}
