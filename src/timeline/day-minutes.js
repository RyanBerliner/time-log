import { $, classNames } from 'lib/node.js';
import { displayHours } from 'lib/date.js';

function applyClasses($DayMinutes, minutes) {
  classNames($DayMinutes, {
    'has-hours': minutes > 0,
  });
}

export default function DayMinutes(minutes) {
  const value = minutes ?? 0;
  const $DayMinutes = $('div.timeline__day-minutes', [displayHours(value)]);
  applyClasses($DayMinutes, value);
  return $DayMinutes;
}

function updateMinutes($DayMinutes, minutes) {
  const value = minutes ?? 0;
  $DayMinutes.innerText = displayHours(value);
  applyClasses($DayMinutes, value);
};

export { updateMinutes };
