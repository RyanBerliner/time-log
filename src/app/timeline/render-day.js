import { $, on, off, stable } from '../../lib/node.js';
import { stringDay } from '../../lib/date.js';
import { __DELETED__ } from '../../lib/state.js';
import { setView, hoursData } from '../data.js';

import HourBlock, * as HourBlockAPI from '../../timeline/hour-block.js';
import DayHeader, * as DayHeaderAPI from '../../timeline/day-header.js';
import Day, * as DayAPI from '../../timeline/day.js';
import { AddHourButton } from '../../timeline/day.js';

function renderHour(hourId) {
  const hour = hoursData.get('hours', hourId);
  const $HourBlock = HourBlock(hour);

  function mount(node) {
    on($HourBlock, 'click', event => {
      setView('log', {
        updateHour: hoursData.get('hours', hourId),
      });
    });

    hoursData.subscribe('hours', hourId, (_, newValue) => {
      if (newValue === __DELETED__) return;
      HourBlockAPI.updateMinutes($HourBlock, newValue.minutes);
      HourBlockAPI.updateLabel($HourBlock, newValue.label);
    });
  }

  return $('li', [$HourBlock], mount);
}

export default function renderDay(date) {
  const key = stringDay(date);
  const hours = stable(renderHour);
  const hourIds = hoursData.get('hoursIndex')?.[key] ?? [];
  function log() { setView('log', {key}); }

  const $DayHeader = DayHeader({date});

  const $AddHourButton = AddHourButton();
  on($AddHourButton, 'click', log);

  const $Day = Day({
    $DayHeader,
    $AddHourButton,
    hourNodes: hours.initial(hourIds),
  });

  function updateHoursSpan() {
    const hourIds = hoursData.get('hoursIndex')?.[key] ?? [];

    const totalHours = hourIds.reduce((acc, curr) => {
      const minutes = hoursData.get('hours')[curr].minutes;
      return acc + minutes;
    }, 0);

    DayHeaderAPI.updateMinutes($DayHeader, totalHours);
  }
  updateHoursSpan();

  function mount(_) {
    if (hourIds.length === 0) {
      on($Day, 'click', log);
      $Day.style.cursor = 'pointer';
    }

    // ew, dont like this at ALL. leaves lingers subs to when things are deleted
    function subTo(hourId) {
      hoursData.subscribe('hours', hourId, (prevValue, newValue) => {
        updateHoursSpan();
      });
    }
    hourIds.forEach(subTo);

    hoursData.subscribe('hoursIndex', key, (prevValue, newValue) => {
      // even more ew
      const newIds = newValue.filter(id => !(prevValue ?? []).includes(id));
      newIds.forEach(subTo);

      hours.update(DayAPI.queryHoursList($Day), newValue);
      updateHoursSpan();

      if (newValue.length > 0) {
        off($Day, 'click', log);
        $Day.style.cursor = 'auto';
        DayAPI.showAddHourButton($Day);
      } else {
        on($Day, 'click', log);
        $Day.style.cursor = 'pointer';
        DayAPI.removeAddHourButton($Day);
      }
    });
  }

  return $('li', [$Day], mount);
}
