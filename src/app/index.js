import { $ } from 'lib/node.js';

import DayTimeline from 'root/timeline/day-timeline.js';

import LogHours from 'app/log-hours.js';
import SendReport, { SendReportTrigger } from 'app/send-report.js';
import UpdateNotice from 'app/update-notice.js';
import renderDay from 'app/timeline/render-day.js';

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

