import { $ } from '../lib/node.js';
import DayTimeline from '../timeline/day-timeline.js';
import LogHours from './log-hours.js';
import SendReport, { SendReportTrigger } from './send-report.js';
import UpdateNotice from './update-notice.js';
import renderDay from './timeline/render-day.js';

const app = $('div.app', [
  UpdateNotice(),
  SendReportTrigger(),
  $('div.page', [
    $('main', [DayTimeline(renderDay)]),
  ]),
  LogHours(),
  SendReport(),
]);

document.getElementById('root').appendChild(app);

