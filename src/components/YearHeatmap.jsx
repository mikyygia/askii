import { useEffect, useState } from "react";
import ReactCalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Paper, Typography } from "@mui/material";
import { supabase } from "../supabaseClient";

function formatISO(date) {
  return date.toISOString().slice(0, 10);
}

export default function YearHeatmap() {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const start = new Date();
      start.setFullYear(start.getFullYear() - 1);
      // fetch entries in the past year
      const { data, error } = await supabase
        .from("entries")
        .select("date")
        .gte("date", start.toISOString());

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
        const key = formatISO(d);
        counts[key] = (counts[key] || 0) + 1;
      });

      const out = [];
      for (let d = new Date(start); d <= new Date(); d.setDate(d.getDate() + 1)) {
        const day = formatISO(new Date(d));
        out.push({ date: day, count: counts[day] || 0 });
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
