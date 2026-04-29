import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import YearHeatmap from "./YearHeatmap";

export default function Home () {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadEntries = async () => {
            setLoading(true);
            setError("");

            const { data, error } = await supabase
                .from("entries")
                .select("*")
                .order("date", { ascending: false });

            if (error) {
                setError(error.message || "Unable to load entries.");
                setEntries([]);
            } else {
                setEntries(data || []);
            }

            setLoading(false);
        };

        loadEntries();
    }, []);

    const formatDate = (value) => {
        if (!value) return "";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
    };

    return (
        <div className="home-page">
            <YearHeatmap />

            <header className="entries-header">
                <h1>Entries</h1>
                {!loading && !error && entries.length > 0 && (
                    <p className="entry-count">{entries.length} saved entries</p>
                )}
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
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}