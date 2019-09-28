# Plugin

[plugin.danfitz.com](https://plugin.danfitz.com)

Plugin is a score-based pomodoro timer with the ability to buy more time using the points you collect. The goal is to keep you accountable when you're working, blocking out work and break time for you. At the same time, most pomodoro timers can feel rigid, especially when you get into the zone and don't want to stop (or are exhausted and need more time away from your work!). A point system gives you the flexibility to extend your work or breaks if you find that you need more time—but only after you've earned those points!

## Tools Used

* JavaScript
* jQuery
* HTML
* CSS (via Sass)
* Responsive design, semantic HTML, and accessibility included too

## Feature Roadmap

**Get `setInterval()` to work even when the user is on a different tab in the browser.** The issue is that the timer doesn't currently count down when the user opens a new tab and leaves Plugin open in the background ([stack overflow reference](https://stackoverflow.com/questions/5927284/how-can-i-make-setinterval-also-work-when-a-tab-is-inactive-in-chrome/5927432#5927432)). The solution seems to be to apply the [Web Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) built into most browsers. Web Worker allows you to run code in a worker thread, which I believe should fix the issue.

**Add browser notifications**. The power of a pomodoro timer is that you should able to leave the app open in the background while you're working but be made aware when the timer hits 0. Currently, there is no feature like that. I want to add browser notifications via the [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API).

## Attributions

Cable icon in animation made by [fjstudio](https://www.flaticon.com/authors/fjstudio) from [www.flaticon.com](https://www.flaticon.com/) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/).
