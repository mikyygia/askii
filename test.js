function formatLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const end = new Date();
end.setHours(0, 0, 0, 0);

const start = new Date(end);
start.setFullYear(start.getFullYear() - 1);

const data = [{"date":"2026-04-29T04:12:40.702+00:00"}, {"date":"2026-04-27T21:02:33+00:00"}];

const counts = {};
(data || []).forEach((row) => {
  const d = new Date(row.date);
  if (Number.isNaN(d.getTime())) return;
  const key = formatLocalISO(d);
  counts[key] = (counts[key] || 0) + 1;
});

const out = [];
for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  const day = formatLocalISO(new Date(d));
  out.push({ date: day, count: counts[day] || 0 });
}

console.log(out.filter(x => x.count > 0));
