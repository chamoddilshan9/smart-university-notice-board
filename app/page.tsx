"use client";
import { useEffect, useState } from "react";

type Notice = {
  _id: string;
  title: string;
  category: string;
  date: string;
  createdAt?: string | null;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all notices from MongoDB
  const fetchNotices = async () => {
    setFetching(true);
    setError(null);

    try {
      const res = await fetch("/api/notices", { cache: "no-store" });

      if (!res.ok) {
        if (res.status === 404)
          throw new Error("No notices found.");
        if (res.status === 500)
          throw new Error("Server error while fetching notices.");
        throw new Error(`Unexpected error (${res.status}).`);
      }

      const data = await res.json();

      const normalized = data.map((n: any) => ({
        _id: n._id,
        title: n.title,
        category: n.category,
        date: n.date,
        createdAt: n.createdAt
          ? new Date(n.createdAt).toLocaleString()
          : null,
      }));

      setNotices(normalized);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach the server. Check internet or API route."
          : err.message || "Failed to load notices."
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Add new notice to MongoDB
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !category || !date) {
      setError("Please fill all fields before submitting.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          date,
        }),
      });

      if (!res.ok) {
        if (res.status === 400)
          throw new Error("Invalid input. Please check all fields.");
        if (res.status === 405)
          throw new Error("Invalid request method.");
        if (res.status === 500)
          throw new Error("Server error while saving the notice.");
        throw new Error(`Unexpected error (${res.status}).`);
      }

      setTitle("");
      setCategory("");
      setDate("");

      await fetchNotices();
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach the server. Check connection or backend."
          : err.message || "Error saving notice."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 dark:bg-black px-4 py-12 font-sans">
      <main className="w-full max-w-3xl">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-black dark:text-zinc-50 text-center">
          Create New Notice 📝
        </h2>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg mx-auto p-6 rounded-xl shadow bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-8"
        >
          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Notice Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="E.g., Company Holiday Schedule"
              className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4">
            <div className="flex-1 mb-4 sm:mb-0">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Notice Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="">Select a category</option>
                <option value="General">General</option>
                <option value="Urgent">Urgent</option>
                <option value="Events">Events</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Date
              </label>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className={`w-full h-12 rounded-full font-semibold text-white ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Save Notice"}
          </button>
        </form>

        <section className="mx-auto max-w-4xl">
          <h3 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
            All Notices
          </h3>

          {fetching && (
            <p className="text-sm text-zinc-500 mb-4">
              Loading notices...
            </p>
          )}

          {!fetching && error && (
            <p className="text-sm text-red-500 mb-4">{error}</p>
          )}

          {!fetching && !error && notices.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No notices yet.
            </p>
          )}

          {!fetching && notices.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <thead>
                  <tr className="text-left">
                    <th className="px-4 py-2">Title</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.map((n) => (
                    <tr
                      key={n._id}
                      className="border-t border-zinc-100 dark:border-zinc-800"
                    >
                      <td className="px-4 py-3">{n.title}</td>
                      <td className="px-4 py-3">{n.category}</td>
                      <td className="px-4 py-3">{n.date}</td>
                      <td className="px-4 py-3">{n.createdAt ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
