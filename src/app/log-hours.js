import { $, on } from '../lib/node.js';
import { stringDay, displayHours } from '../lib/date.js';
import { state } from '../lib/state.js';

import { Dialog } from './dialog.js';
import { setView, appState, hoursData } from './data.js';

function AdjusterButton({amount, label, adjust}) {
  function mount(node) {
    return on(node, 'click', e => {
      adjust(parseInt(e.target.dataset.amount));
    });
  }


  return $(`button[type="button"][data-amount="${amount}"]`, [label], mount);
}

function LogHours() {
  const defaultMinutes = 60;
  const minutesState = state({minutes: defaultMinutes});

  const $CancelButton = $('button.cancel[type="button"]', ['Cancel']);
  on($CancelButton, 'click', () => setView(''));

  const $DeleteButton = $('button.danger[type="button"][style="display:none;"]', ['Delete']);
  const $DangerZone = $('div.danger-zone[style="display:none;"]', [
    $('p', ['No longer need this time logged? You can delete it, but this action cannot be undone.']),
    $('button.danger[type="button"]', ['Permanently Delete']),
  ]);

  const defaultLabel = 'Unnamed';
  const $LabelInput = $(`input[value="${defaultLabel}"]`);

  const defaultLocation = '';
  const $LocationInput = $(`input[type="text"][value="${defaultLocation}"][placeholder="No location"]`);

  function formMount(node) {
    on(node, 'submit', formSubmit);

    on($DangerZone, 'click', event => {
      if (!event.target.closest('button')) return;

      const updateId = appState.get('viewData', 'updateHour', 'id');
      if (!updateId) return;

      const doit = confirm('Are you sure you\'d like to permanently delete this time?');
      if (!doit) return;

      const item = hoursData.get('hours', updateId);
      hoursData.del('hours', updateId);
      hoursData.set('hoursIndex', item.dayKey, prev => (prev ?? []).filter(id => id !== updateId));
      setView('');
    });

    function reset() {
      minutesState.set('minutes', defaultMinutes);
      $LabelInput.value = defaultLabel;
      $LocationInput.value = defaultLocation;
      $DangerZone.style.display = 'none';
    }

    reset();

    let resetTimeout;
    appState.subscribe('viewData', (_, viewData) => {
      window.clearTimeout(resetTimeout)

      if (!viewData.updateHour) {
        resetTimeout = window.setTimeout(reset, 500);
        return;
      };

      minutesState.set('minutes', viewData.updateHour.minutes);
      $LabelInput.value = viewData.updateHour.label;
      $LocationInput.value = viewData.updateHour.metadata?.location ?? '';
      $DangerZone.style.display = null;
    });
  }

  function formSubmit(event) {
    event.preventDefault();
    const updateId = appState.get('viewData', 'updateHour', 'id');
    const updateItem = updateId ? hoursData.get('hours', updateId) : null;
    const key = updateItem?.dayKey ?? appState.get('viewData').key;

    const hour = {
      id:  updateId ?? crypto.randomUUID(),
      label: $LabelInput.value,
      metadata: { location: $LocationInput.value },
      dayKey: key,
      minutes: minutesState.get('minutes'),
    };

    hoursData.set('hours', hour.id, hour);

    if (!updateId) {
      const today = new Date();

      hoursData.set('hoursIndex', key, prev => {
        return [...(prev ?? []), hour.id];
      });
    }

    setView('');
  }

  function adjust(amount) {
    minutesState.set('minutes', prev => prev+amount);
  }

  const $MinutesSpan = $('span.minutes', [displayHours(minutesState.get('minutes'))]);
  minutesState.subscribe('minutes', (_, newValue) => {
    $MinutesSpan.innerText = displayHours(newValue);
  });

  return Dialog('log', [
    $('form.app__log-hours', [
      $('div.header', [
        $CancelButton,
        $('div.inputs', [
          $LabelInput,
          $LocationInput
        ]),
        $('button.primary.check[type="submit"]', ['Submit']),
      ]),
      $MinutesSpan,
      $('div.adjusters', [
        $('div', [[-60, '-1h'], [-30, '-30m'], [-15, '-15m']].map(([amount, label]) => {
          return AdjusterButton({amount, label, adjust});
        })),
        $('div', [[60, '+1h'], [30, '+30m'], [15, '+15m']].map(([amount, label]) => {
          return AdjusterButton({amount, label, adjust});
        })),
      ]),
      $DangerZone,
    ], formMount),
  ]);
}

export { LogHours };
