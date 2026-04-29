import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

function formatDateDisplay(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

function parseYYYYMMDDLocal(value) {
  if (!value || typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, monthIndex, day);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function EntriesByDate() {
  const { date } = useParams(); // expected YYYY-MM-DD
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upvotingId, setUpvotingId] = useState(null);
  const [sortMode, setSortMode] = useState("recent"); // recent | top

  useEffect(() => {
    const load = async () => {
      if (!date) return;
      setLoading(true);
      setError("");

      try {
        const start = parseYYYYMMDDLocal(date);
        if (!start) {
          setError("Invalid date. Expected YYYY-MM-DD.");
          setEntries([]);
          return;
        }
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

        const query = supabase
          .from("entries")
          .select("*")
          .gte("date", start.toISOString())
          .lte("date", end.toISOString());

        if (sortMode === "top") {
          query.order("upvotes", { ascending: false }).order("date", { ascending: false });
        } else {
          query.order("date", { ascending: true });
        }

        const { data, error } = await query;

        if (error) {
          setError(error.message || "Failed to load entries for date.");
          setEntries([]);
        } else {
          const rows = data || [];
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
              return da - db; // ascending by time for single-day view
            });
          }
          setEntries(rows);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [date, sortMode]);

  const upvoteEntry = async (entry) => {
    if (!entry?.id) return;
    if (upvotingId) return;

    const prevUpvotes = Number(entry.upvotes ?? 0);
    const nextUpvotes = prevUpvotes + 1;

    setUpvotingId(entry.id);
    setError("");
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, upvotes: nextUpvotes } : e)));

    try {
      const { data, error } = await supabase.rpc("increment_upvote", { p_id: entry.id });
      if (error) {
        setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, upvotes: prevUpvotes } : e)));
        setError(error.message || "Failed to upvote.");
      } else {
        const newUpvotes = Array.isArray(data) ? data[0] : data;
        setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, upvotes: Number(newUpvotes ?? nextUpvotes) } : e)));
      }
    } catch (err) {
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, upvotes: prevUpvotes } : e)));
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUpvotingId(null);
    }
  };

  return (
    <div className="home-page">
      <header className="entries-header">
        <h1>Entries for {date}</h1>
        <p>
          <Link to="/">← Back</Link>
        </p>
        <div className="entries-controls">
          <label className="entries-sort">
            Sort:
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} aria-label="Sort entries">
              <option value="recent">Time</option>
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
        <p className="status-message">No entries found for this day.</p>
      ) : (
        <div className="entries-list">
          {entries.map((e) => (
            <article key={e.id} className="entry-row">
              <div className="entry-date">{formatDateDisplay(e.date)}</div>
              <div className="entry-content">{e.content}</div>
              <div className="entry-actions">
                <button
                  className="upvote-btn"
                  onClick={() => upvoteEntry(e)}
                  disabled={upvotingId === e.id}
                  aria-label="Upvote entry"
                  title="Upvote"
                >
                  ▲ {Number(e.upvotes ?? 0)}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
