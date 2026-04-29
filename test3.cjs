const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Heatmap = require('react-calendar-heatmap').default || require('react-calendar-heatmap');

const values = [{ date: new Date(2026, 3, 28), count: 1 }]; // April is month 3
const el = React.createElement(Heatmap, {
  startDate: new Date(2026, 3, 20),
  endDate: new Date(2026, 3, 30),
  values: values,
  classForValue: (val) => val && val.count ? 'has-value' : 'empty'
});

console.log(ReactDOMServer.renderToString(el));
