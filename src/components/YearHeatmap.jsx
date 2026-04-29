import { useEffect, useState } from "react";
import ReactCalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Paper, Typography } from "@mui/material";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

function formatISO(date) {
  return date.toISOString().slice(0, 10);
}

function formatLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function YearHeatmap() {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const end = new Date();
      end.setHours(0, 0, 0, 0);

      const start = new Date(end);
      start.setFullYear(start.getFullYear() - 1);
      // fetch entries in the past year
      const { data, error } = await supabase
        .from("entries")
        .select("date")
        .gte("date", start.toISOString())
        .lte("date", new Date(end.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString());

      if (error) {
        console.error("Heatmap load error:", error);
        setValues([]);
        setLoading(false);
        return;
      }

      const counts = {};
      (data || []).forEach((row) => {
        const d = new Date(row.date);
        if (Number.isNaN(d.getTime())) return;
        // TIMESTAMPTZ comes back with timezone; bucket by *local* day for display.
        const key = formatLocalISO(d);
        counts[key] = (counts[key] || 0) + 1;
      });

        const out = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = formatLocalISO(new Date(d));
        out.push({ 
            date: day, // Keep it as the YYYY-MM-DD string
            count: counts[day] || 0 
        });
        }

      setValues(out);
      setLoading(false);
    };

    load();
  }, []);

  const classForValue = (value) => {
    if (!value || value.count === 0) return "heatmap-empty";
    if (value.count >= 4) return "heatmap-4";
    if (value.count === 3) return "heatmap-3";
    if (value.count === 2) return "heatmap-2";
    return "heatmap-1";
  };

  return (
    <Paper elevation={1} sx={{ padding: 2, marginBottom: 24 }}>
      <Typography variant="h6" gutterBottom>
        Activity (last 12 months)
      </Typography>

      {loading ? (
        <Typography variant="body2">Loading heatmap...</Typography>
      ) : (
        <ReactCalendarHeatmap
            startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
            endDate={new Date()}
            values={values}
            classForValue={classForValue}
            showWeekdayLabels
            onClick={(value) => {
              if (!value || !value.date) return;
              // navigate to entries for the clicked date (YYYY-MM-DD)
              navigate(`/entries/${value.date}`);
            }}
            tooltipDataAttrs={(value) => {
              if (!value || !value.date) return {};
              return {
                "data-tip": `${value.date}: ${value.count} entry${value.count !== 1 ? "s" : ""}`,
              };
            }}
        />
      )}
    </Paper>
  );
}
