import { $, classNames } from 'lib/node.js';
import { isToday } from 'lib/date.js';

export default function DayDate(date) {
  const $DayDate = $('div.timeline__day-date', [
    $('span.month', [date.toLocaleDateString(undefined, { month: 'short' })]),
    $('span.date', [date.toLocaleDateString(undefined, { day: '2-digit' })]),
  ]);

  classNames($DayDate, { 'today': isToday(date) });

  return $DayDate;
}
