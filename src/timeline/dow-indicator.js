import { $, classNames } from 'lib/node.js';
import { isToday } from 'lib/date.js';

export default function DOWIndicator(date) {
  // 0 is Sunday
  // TODO: make the ordering customizable
  const ordering = [
    [1, 'M'],
    [2, 'Tu'],
    [3, 'W'],
    [4, 'Th'],
    [5, 'F'],
    [6, 'Sa'],
    [0, 'Su'],
  ];

  const $Days = ordering.map(([dow, label]) => {
    const $DOW = $('span', [label]);
    const match = date.getDay() === dow;

    classNames($DOW, {
      'is-today': match && isToday(date),
      'is-dow': match,
    });

    return $DOW;
  });

  return $('div.timeline__dow-indicator', $Days);
}
