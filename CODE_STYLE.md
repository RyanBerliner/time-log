# Code Style

The code style outlined below is considered necessary to maintain order in this
codebase. Please follow that to the best of your ability and when appropriate.

## JavaScript

### Components

UI components are to be mostly created with the `lib/node.js` helper `$`. Since
this just returns an html element, it's not technically required, but should be
used most of the time since it provides some conveniences that reduce the
amount of code that needs to be written.

The same goes for the `on` event listener function from the `lib/node.js` file.
This (and other `lib/node.js` helpers) are conveniences that make sense to use
most of the time to reduce typing.

Components should almost always be pure, in that they have no side effects.
They should just display the data they are asked to display, and provide API
functions to update them. These are to be placed outside the `app/` directory,
since even though they may be built just for this app, they should not be wired
up to the app in their base "pure" form.

Consider an accordion component. You might expect to see files like

- `src/accordion.js`
- `src/accordion.css`
- `tests/manual/accordion.html`

Each component should have a corresponding CSS file, and a manual html test
that lets developers play with the component and see it in different forms
without being bothered to find it in the app. This manual test file is why it
matters so much that components are pure, so they can be used outside the
surrounding context of the app.

#### Wiring Up Components

To make use of pure components in the context of the app, they need to be wired
up to the appropriate data, events, etc. This is often done with a small wrapper
component inside the `app/` directory that imports their pure counterparts and
adds the appropriate context to them.

#### Scoping Component CSS

Every component should have a wrapping class that matches its file system
location, and every CSS rule should use this wrapping class. For example if a
component is defined in `src/timeline/day.js`, the expected CSS class would be
`timeline__day`.

#### Component File Structure

Each component file should export the primary component as its default export,
and any API functions to modify the component as named exports. This allows
call sites to import components like so:

```
import Day, * as DayAPI from 'root/timeline/day.js';
```

This structure should almost always be followed for consistency unless there is
a really good reason not to.

### Importing Modules

Always use the import map aliases when importing modules. This means you should
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

import Day, * as DayAPI from 'root/timeline/day.js';
import DayDate from 'root/timeline/day-date.js';
import DOWIndicator from 'root/timeline/dow-indicator.js';
import DayMinutes, * as DayMinutesAPI from 'root/timeline/day-minutes.js';
import HourBlock, * as HourBlockAPI from 'root/timeline/hour-block.js';

import { setView, hoursData } from 'app/data.js';
```

You can imagine even more specific imports coming later as well.

## Misc Philosophies

- If something is done for a stupid or quirky reason, add a comment to explain.
- Do not use runtime dependencies. Do not use build dependencies (basic
  scripting OK). Source code must be browser native HTML, JavaScript, CSS only.
- Try keeping lines of code < 80 characters wide. I like running a split on my
  laptop and don't want characters to run off when it can be avoided. This is
  not a hard rule, use your judgement (as with everything in this document).
