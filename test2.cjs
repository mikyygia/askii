const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Heatmap = require('react-calendar-heatmap').default || require('react-calendar-heatmap');

const values = [{ date: '2026-04-28', count: 1 }];
const el = React.createElement(Heatmap, {
  startDate: new Date('2026-04-20T12:30:00'),
  endDate: new Date('2026-04-30T15:45:00'),
  values: values,
  classForValue: (val) => val && val.count ? 'has-value' : 'empty'
});

console.log(ReactDOMServer.renderToString(el));
