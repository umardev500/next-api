"use client";

import { FormEvent, useEffect, useState } from "react";

type SavedUrl = {
  id: number;
  url: string;
  created_at: string;
  updated_at: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState<SavedUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  async function loadUrls() {
    try {
      const response = await fetch("/api/urls");

      if (!response.ok) {
        throw new Error("Failed to load URLs");
      }

      const data = await response.json();
      setUrls(data);
    } catch {
      setError("Failed to load saved URLs");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadUrls();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Please enter a URL");
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: trimmedUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save URL");
      }

      setUrls((current) => [
        {
          id: data.id,
          url: data.url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...current,
      ]);

      setUrl("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to save URL"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Saved URLs
          </h1>

          <p className="mt-2 text-gray-500">
            Save and manage your URLs in one place.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save URL"}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </form>

        <section className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Saved URLs
            </h2>
          </div>

          {fetching ? (
            <div className="p-5 text-sm text-gray-500">
              Loading...
            </div>
          ) : urls.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No URLs saved yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {urls.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 truncate text-blue-600 hover:underline"
                  >
                    {item.url}
                  </a>

                  <span className="shrink-0 text-xs text-gray-400">
                    #{item.id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}