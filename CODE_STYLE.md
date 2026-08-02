## Javascript

### Importing Modules

Always use the importmap aliases when importing modules. This means you should
never use ./ or ../../ etc when importing files, since doing this makes it more
difficult to move files around and makes it harder for developers to orient
themselves.

When importing modules, group imports by their alias, and start with the most
general alias first, moving towards more specific and niche modules. For
example this code first imports `lib` (which is generalized to any
application), then `root` which is specific to this project but still pure,
then `app` which has app specific side effects.

```
import { $, on, off, stable } from 'lib/node.js';
import { stringDay } from 'lib/date.js';
import { __DELETED__ } from 'lib/state.js';

import HourBlock, * as HourBlockAPI from 'root/timeline/hour-block.js';
import DayHeader, * as DayHeaderAPI from 'root/timeline/day-header.js';
import Day, * as DayAPI from 'root/timeline/day.js';
import { AddHourButton } from 'root/timeline/day.js';

import { setView, hoursData } from 'app/data.js';
```

You can imagine even more specific imports coming later as well.
