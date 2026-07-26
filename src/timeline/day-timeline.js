import { $ } from '../lib/node.js';
import { quantized } from '../lib/date.js';
import { timelinePaginator, Timeline } from '../lib/timeline.js';

export default function DayTimeline(renderDay) {
  const dayPaginator = timelinePaginator({
    anchor: quantized(new Date(), 1000 * 60 * 60 * 24),
    pageSize: 10,
    stepSize: 1,
    stepForward: (x, n) => x.setDate(x.getDate() + n),
  });

  const $Offset = $('div');
  const $List = $('ul[style="list-style:none;"]');
  const $Tall = $('div', [$Offset, $List]);

  function mount(node) {
    const timeline = Timeline({
      container: node,
      tall: $Tall,
      offset: $Offset,
      list: $List,
      paginator: dayPaginator,
      renderItem: renderDay,
    });

    timeline.init();
  }

  return $('div[style="scrollbar-width:none;"]', [$Tall], mount);
}
