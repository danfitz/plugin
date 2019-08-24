# Pomodoro Game

I will be making a gamified pomodoro app. Here's how the Minimum Viable Product would work:

1. Press start. The app will cycle through a 25/5/25/5/25/5/25/20 minute cycle over and over again.
2. The user is given a score. Every second that the timer runs, the user gains points.

## Stretch Goals

* When the timer reaches 0, the user has to tap in or else they start losing points
* Ability for the user to buy more time on the timer using their points (incentivizes consistency yet allows for flexibility)
* Add avatar & world to UI
* Completing a cycle leads to bonus points
* Customize task time, short break time, long break time
* Pause button
* Done button
* Ability to share final score via social media share buttons in done prompt
* Add more animations and game components

## Pseudocode

```js
// 1. Initialize variable with starting score of 0
// 2. Initialize array with [25,5,25,5,25,5,25,20] values to represent cycle

// 3. When start button is clicked, start looping through cycle array
// 4. For each loop, start a setInterval that, every 1 second, will...
	// a. Increase score and update value on page
    // b. Decrease timer and update value on page
```

## Attributions

Cable icon in animation made by [fjstudio](https://www.flaticon.com/authors/fjstudio) from [www.flaticon.com](https://www.flaticon.com/) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/).

## For upcoming presentation...

### Technical Challenge

`setInterval()` runs **asynchronously**. That means that it allows the next lines of code after it to run *while it's still running in the background*. Traditional code runs in sequence.

Figuring out a sensible way of managing this was the tricky part. I ran into infinite loop issues because I had code underneath it that called the same method with `setInterval()` inside.

My solution was to not have any code run immediately after.

### Technical Win
