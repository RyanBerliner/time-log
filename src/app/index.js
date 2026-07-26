import { $ } from '../lib/node.js';
import { LogHours } from './log-hours.js';
import DayTimeline from '../timeline/day-timeline.js';
import renderDay from './timeline/render-day.js';

const app = $('div.app', [
  $('div.page', [
    $('main', [DayTimeline(renderDay)]),
  ]),
  LogHours(),
]);

document.getElementById('root').appendChild(app);

