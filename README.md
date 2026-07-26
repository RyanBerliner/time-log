# Time Log

An offline PWA for logging time.

## How to install on your phone

Visit [https://ryanberliner.com/time-log/index.html](https://ryanberliner.com/time-log/index.html).

To install on your home screen (which is **required for offline usage**), follow the instructions for your type of phone.

- [Instructions for iPhone](https://www.macrumors.com/how-to/add-a-web-link-to-home-screen-iphone-ipad/)
- [Instructions for Android](https://www.howtogeek.com/667938/how-to-add-a-website-to-your-android-home-screen/)

## Development

Because this project uses native browser ESM, you can't just open up
src/index.html in your browser... the browser imposes security restrictions on
ESM that prevents this from working properly.

So, start a simple python server with `./scripts/dev.sh` and open [localhost:8000](http://localhost:8000)
in your browser.

From there you can:

- View the app at [localhost:8000/src/index.html](http://localhost:8000/src/index.html)
- Browse manual tests at [localhost:8000/tests/manual/](http://localhost:8000/tests/manual/)

This PWA uses a service worker to caches assets, so to see your updates, you
must open the application tab in devtools, navigate to service worker, and
enable updating on reload.

## Deployment

Run `./scripts/build.sh`. This will update `src/service-worker.js` to tag a new
file cache and udpate the list of files. Commit the result with something like
"release blah blah". Push the commit, and a GitHub action will see the
`src/service-worker.js` change and trigger a deployment.
