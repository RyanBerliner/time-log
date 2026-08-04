import { $, classNames } from 'lib/node.js';
import { isToday } from 'lib/date.js';

// Holds references to each $Day's $AddHourButton, even when its not mounted
// so it can be easily checked and readded.
//
// IDEA: we could add a `state` WeakMap to the node.js file itself to hold
//       all internal state for each node, as our own sort of data attribute
//       for various types of data. Could export set,get,del, as our own little
//       event system for components. so intead of showAddHourButton it would
//       be set($Day, 'showButton', true). Each node would have a public api
//       of things that could be set. Them maybe there is a shorter syntax
//       for mapping state subscriptions from state.js to set calls on
//       components... like a "follow" or something. This is referred to as
//       bind in other frameworks I think.
const ADD_HOURS_BUTTON_MAP = new WeakMap();

function AddHourButton(date) {
  const $Button = $('button', ['＋']);
  classNames($Button, { 'primary': isToday(date) });
  return $Button;
}

function showAddHourButton($Day) {
  const $AddHourButton = ADD_HOURS_BUTTON_MAP.get($Day);

  if ($Day.contains($AddHourButton)) {
    return;
  }

  const content = $Day.querySelector(':scope > .add-button-container');
  content.appendChild($AddHourButton);
}

function removeAddHourButton($Day) {
  const $AddHourButton = ADD_HOURS_BUTTON_MAP.get($Day);

  if (!$Day.contains($AddHourButton)) {
    return;
  }

  $AddHourButton.remove();
}

function queryHoursList($Day) {
  return $Day.querySelector(':scope > div.content > ul');
}

export default function Day({
  $DayDate,
  $DOWIndicator,
  $AddHourButton,
  $DayMinutes,
  hourNodes
}) {
  const $Day = $('div.timeline__day', [
    $('div.day-date-container', [$DayDate]),
    $('div.dow-indicator-container', [$DOWIndicator]),
    $('div.minutes-container', [$DayMinutes]),
    $('div.add-button-container', []),
    $('div.content', [$('ul', hourNodes)]),
  ]);

  ADD_HOURS_BUTTON_MAP.set($Day, $AddHourButton);

  if (hourNodes.length > 0) {
    showAddHourButton($Day);
  }

  return $Day;
}

export {
  AddHourButton,
  showAddHourButton,
  removeAddHourButton,
  queryHoursList,
};
