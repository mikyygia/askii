import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import YearHeatmap from "./YearHeatmap";

export default function Home () {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [upvotingId, setUpvotingId] = useState(null);
    const [sortMode, setSortMode] = useState("recent"); // recent | top

    useEffect(() => {
        const loadEntries = async () => {
            setLoading(true);
            setError("");

            const query = supabase
                .from("entries")
                .select("*");

            if (sortMode === "top") {
                query.order("upvotes", { ascending: false }).order("date", { ascending: false });
            } else {
                query.order("date", { ascending: false });
            }

            const { data, error } = await query;

            if (error) {
                setError(error.message || "Unable to load entries.");
                setEntries([]);
            } else {
                const rows = data || [];
                // Server-side ordering should work, but fall back to client-side sort
                if (sortMode === "top") {
                    rows.sort((a, b) => {
                        const ua = Number(a.upvotes ?? 0);
                        const ub = Number(b.upvotes ?? 0);
                        if (ub !== ua) return ub - ua;
                        const da = new Date(a.date).getTime() || 0;
                        const db = new Date(b.date).getTime() || 0;
                        return db - da;
                    });
                } else {
                    rows.sort((a, b) => {
                        const da = new Date(a.date).getTime() || 0;
                        const db = new Date(b.date).getTime() || 0;
                        return db - da;
                    });
                }

                setEntries(rows);
            }

            setLoading(false);
        };

        loadEntries();
    }, [sortMode]);

    const formatDate = (value) => {
        if (!value) return "";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
    };

    const deleteEntry = async (id) => {
        if (!id) return;
        const ok = confirm("Delete this entry permanently?");
        if (!ok) return;

        try {
            setDeletingId(id);
            const { error } = await supabase.from("entries").delete().eq("id", id);
            if (error) {
                setError(error.message || "Failed to delete entry.");
                return;
            }

            setEntries((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setDeletingId(null);
        }
    };

    const upvoteEntry = async (entry) => {
        if (!entry?.id) return;
        if (upvotingId) return;

        const prevUpvotes = Number(entry.upvotes ?? 0);
        const nextUpvotes = prevUpvotes + 1;

        setUpvotingId(entry.id);
        setError("");
        setEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, upvotes: nextUpvotes } : e))
        );

        try {
                // Use a secure RPC to increment upvotes server-side and return the new value
                const { data, error } = await supabase.rpc("increment_upvote", { p_id: entry.id });

                if (error) {
                    // rollback optimistic update
                    setEntries((prev) =>
                        prev.map((e) => (e.id === entry.id ? { ...e, upvotes: prevUpvotes } : e))
                    );
                    setError(error.message || "Failed to upvote.");
                } else {
                    const newUpvotes = Array.isArray(data) ? data[0] : data;
                    setEntries((prev) =>
                        prev.map((e) => (e.id === entry.id ? { ...e, upvotes: Number(newUpvotes ?? nextUpvotes) } : e))
                    );
                }
        } catch (err) {
            setEntries((prev) =>
                prev.map((e) => (e.id === entry.id ? { ...e, upvotes: prevUpvotes } : e))
            );
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setUpvotingId(null);
        }
    };

    return (
        <div className="home-page">
            <YearHeatmap />

            <header className="entries-header">
                <h1>Entries</h1>
                {!loading && !error && entries.length > 0 && (
                    <p className="entry-count">{entries.length} saved entries</p>
                )}
                <div className="entries-controls">
                    <label className="entries-sort">
                        Sort:
                        <select
                            value={sortMode}
                            onChange={(e) => setSortMode(e.target.value)}
                            aria-label="Sort entries"
                        >
                            <option value="recent">Recent</option>
                            <option value="top">Upvotes</option>
                        </select>
                    </label>
                </div>
            </header>

            {loading ? (
                <p className="status-message">Loading entries...</p>
            ) : error ? (
                <p className="status-message error">{error}</p>
            ) : entries.length === 0 ? (
                <p className="status-message">No entries yet.</p>
            ) : (
                <div className="entries-list">
                    {entries.map((entry) => (
                        <article
                            key={entry.id ?? `${entry.date}-${entry.content}`}
                            className="entry-row"
                        >
                            <div className="entry-date">{formatDate(entry.date)}</div>
                            <div className="entry-content">{entry.content}</div>
                            <div className="entry-actions">
                                <button
                                    className="upvote-btn"
                                    onClick={() => upvoteEntry(entry)}
                                    disabled={upvotingId === entry.id}
                                    aria-label="Upvote entry"
                                    title="Upvote"
                                >
                                    ▲ {Number(entry.upvotes ?? 0)}
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteEntry(entry.id)}
                                    disabled={deletingId === entry.id}
                                    aria-label="Delete entry"
                                >
                                    {deletingId === entry.id ? "Deleting…" : "Delete"}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
