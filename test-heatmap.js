import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Heatmap from 'react-calendar-heatmap';

const values = [{ date: '2026-04-28', count: 1 }];
const el = React.createElement(Heatmap, {
  startDate: new Date('2026-04-20T00:00:00'),
  endDate: new Date('2026-04-30T00:00:00'),
  values: values,
  classForValue: (val) => val && val.count ? 'has-value' : 'empty'
});

console.log(ReactDOMServer.renderToString(el));
