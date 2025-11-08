"use client";

import { useEffect } from "react";

export default function UsersError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-4">
      <h1 className="text-2xl font-semibold text-red-600">
        Oops! Something went wrong.
      </h1>
      <p className="text-muted-foreground">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}
