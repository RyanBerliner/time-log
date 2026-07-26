import { $ } from './../lib/node.js';
import { displayHours } from './../lib/date.js';

export default function DayHeader({date, minutes}) {
  let dow = date.toLocaleDateString(undefined, {weekday: 'short'});
  dow = /^(s|t)/i.test(dow) ? dow.slice(0, 2) : dow[0];

  const longDate = date.toLocaleDateString(undefined, {
    month: 'long', day: 'numeric', year: '2-digit'
  });

  const today = date.toDateString() === (new Date()).toDateString();

  return $('div.timeline__day-header', [
    $(`span.dow-${date.getDay()}`, [dow]),
    $(`span.date${today ? '.today' : ''}`, [today ? 'Today' : longDate]),
    $('span.hours', [displayHours(minutes ?? 0)]),
  ]);
}

function updateMinutes($DayHeader, minutes) {
  $DayHeader.querySelector(':scope > span.hours').innerText = displayHours(minutes ?? 0);
};

export { updateMinutes };
