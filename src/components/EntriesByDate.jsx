import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

function formatDateDisplay(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

export default function EntriesByDate() {
  const { date } = useParams(); // expected YYYY-MM-DD
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!date) return;
      setLoading(true);
      setError("");

      try {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

        const { data, error } = await supabase
          .from("entries")
          .select("*")
          .gte("date", start.toISOString())
          .lte("date", end.toISOString())
          .order("date", { ascending: true });

        if (error) {
          setError(error.message || "Failed to load entries for date.");
          setEntries([]);
        } else {
          setEntries(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [date]);

  return (
    <div className="home-page">
      <header className="entries-header">
        <h1>Entries for {date}</h1>
        <p>
          <Link to="/">← Back</Link>
        </p>
      </header>

      {loading ? (
        <p className="status-message">Loading entries...</p>
      ) : error ? (
        <p className="status-message error">{error}</p>
      ) : entries.length === 0 ? (
        <p className="status-message">No entries found for this day.</p>
      ) : (
        <div className="entries-list">
          {entries.map((e) => (
            <article key={e.id} className="entry-row">
              <div className="entry-date">{formatDateDisplay(e.date)}</div>
              <div className="entry-content">{e.content}</div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
