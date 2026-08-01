import { $, on, stable } from '../lib/node.js';
import { stringDay, quantized, displayHours } from '../lib/date.js';

import { Dialog } from './dialog.js';
import { setView, hoursData, appState } from './data.js';

function SendReportTrigger() {
  const $Button = $('button.primary.app__send-report__trigger', ['Send Report']);
  on($Button, 'click', () => setView('send-report'));

  return $Button;
}

function DayReport(date) {
  const key = stringDay(date);
  const hourIds = hoursData.get('hoursIndex', key) ?? [];
  const totalMinutes = hourIds.reduce((acc, hourId) => {
    const hour = hoursData.get('hours', hourId);
    return acc + hour.minutes;
  }, 0);

  return $('li', [
    $('div', [
      date.toLocaleDateString(undefined, {weekday: 'long'}),
      ` - ${displayHours(totalMinutes)}`,
    ]),
    $('ul', hourIds.map(id => {
        const hour = hoursData.get('hours', id);
        return $('li', [displayHours(hour.minutes), ' ', hour.label, ' @ ', hour.metadata?.location || 'Unknown']);
    })),
    ...(hourIds.length ? [] : [$('span', ['No hours'])]),
    // empty p for spacing when sending via email
    $('p', [' ']),
  ]);
}

export default function SendReport() {
  const $CancelButton = $('button.cancel[type="button"]', ['Cancel']);
  on($CancelButton, 'click', () => setView(''));

  const $Mailto = $('a.button.primary.send', ['Send via Email']);
  on($Mailto, 'click', () =>
    setView('')
    // then the mailto will open up the users email client
  );

  const days = stable(DayReport);
  const $Days = $('ul', days.initial([]));

  const $Total = $('p.total', []);

  function updateTotalMinutes(dates) {
    const hourIds = dates.map(date => {
      const key = stringDay(date);
      return hoursData.get('hoursIndex', stringDay(date)) ?? [];
    }).flat();

    const totalMinutes = hourIds.reduce((acc, hourId) => {
      const hour = hoursData.get('hours', hourId);
      return acc + hour.minutes;
    }, 0);

    $Total.innerText = `${displayHours(totalMinutes)} total`;
  }

  const $TimeRange = $('select', [
    $('option[value="thisweek"]', ['This Week']),
    $('option[value="lastweek"]', ['Last Week']),
  ]);

  const $Report = $('div.report[contenteditable="true"]', [
    $Total,
    $Days,
  ]);

  on($TimeRange, 'change', event => {
    let startDate = quantized(new Date(), 1000 * 60 * 60 * 24);
    // 1 === Monday
    // TODO: allow customizing the week start day
    while (startDate.getDay() !== 1) {
      startDate.setDate(startDate.getDate() - 1);
    }

    if (event.target.value === 'lastweek') {
      startDate.setDate(startDate.getDate() - 7);
    }

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }

    days.update($Days, dates);
    updateTotalMinutes(dates); 

    // HACK: let the dom render first
    setTimeout(() => {
      const body = encodeURIComponent($Report.innerText);
      const subject = encodeURIComponent(`Hours for week of ${startDate.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
      })}`);
      $Mailto.href = `mailto:?subject=${subject}&body=${body}`;
    }, 0);
  });

  appState.subscribe('view', (prevValue, newValue) => {
    if (newValue === 'send-report') {
      $TimeRange.value = 'lastweek';
      // TODO: We should use the native node dispatch api for the event binding
      //       idea, and where each node can expose an api for different events
      $TimeRange.dispatchEvent(new Event('change'));
    }
  });

  return Dialog('send-report', [
    $('form.app__send-report', [
      $('div.header', [
        $CancelButton,
        $TimeRange,
        $Mailto,
      ]),
      $Report,
    ]),
  ]);
}

export { SendReportTrigger };
