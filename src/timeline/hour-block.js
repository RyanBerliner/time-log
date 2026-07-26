import { $ } from './../lib/node.js';
import { displayHours } from './../lib/date.js';

export default function HourBlock(hourBlock) {
  return $('span.timeline__hour-block', [
    $('strong', [displayHours(hourBlock.minutes)]),
    $('span', [hourBlock.label]),
  ]);
}

function updateMinutes($HourBlock, minutes) {
  $HourBlock.querySelector(':scope > strong').innerText = displayHours(minutes);
}

function updateLabel($HourBlock, label) {
  $HourBlock.querySelector(':scope > span').innerText = label;
}

export { updateMinutes, updateLabel };
