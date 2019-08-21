// Declare app
const app = {};

// Initialize starting properties for app
app.score = 0; // score for game
app.taskTime = 0.25; // in milliseconds
app.shortBreakTime = 5; // in minutes
app.longBreakTime = 20; // in minutes
app.paddingTime = 1; // in minutes
app.cycle = [
    app.taskTime,
    app.shortBreakTime,
    app.taskTime,
    app.shortBreakTime,
    app.taskTime,
    app.shortBreakTime,
    app.taskTime,
    app.longBreakTime
];

// Method that converts milliseconds to mm:ss and inserts value on page
app.updateTimer = function(timerSelector, inputMilliseconds) {
    // Convert input time to positive number if negative
    let milliseconds = inputMilliseconds < 0 ? -inputMilliseconds : inputMilliseconds;

    // Extract seconds
    let seconds = (milliseconds / 1000) % 60;
    // Add 0 at beginning of seconds if value is between 0 to 9
    seconds = seconds.toString().length === 1 ? "0" + seconds : seconds;
    // Extract minutes
    let minutes = (milliseconds / 1000 - seconds) / 60;
    // Add 0 at beginning of minutes if value is between 0 to 9
    minutes = minutes.toString().length === 1 ? "0" + minutes : minutes;

    // Concatenate minutes and seconds into mm:ss format
    const formattedTime = minutes + ":" + seconds;

    // Insert/update currentTime on page
    $(timerSelector).text(formattedTime);
};

// Method that runs through one full unit of time
app.startTimer = function() {
    let currentTime = app.cycle[0] * 60000; // converted to milliseconds
    app.updateTimer(".currentTimer", currentTime); // Initialize start time
    
    // Move chosen time to end of cycle array
    const timeToMoveToEnd = app.cycle.shift();
    app.cycle.push(timeToMoveToEnd);

    // At a rapid interval:
    // 1. Update current time
    // 2. Update score
    const intervalId = setInterval(function() {
        // Decrease timer
        currentTime -= 10;
        
        // Update time on page exactly every 1 second
        if (currentTime % 1000 === 0) {
            app.updateTimer(".currentTimer", currentTime);
        }

        // Increase score and update value on page as long as time is positive
        if (currentTime >= -5000) {
            // 
            if (currentTime >= 0) {
                app.score += 1;
                $(".currentScore").text(app.score);
            } else {
                $(".currentTimer").css("background", "yellow"); // visual signal
            }
            
        // Otherwise, user is in overtime and score decreases
        } else {
            $(".currentTimer").css("background", "red"); // visual signal
            app.score -= 1;
            $(".currentScore").text(app.score);
        };
    }, 1000);
};

// clearInterval(intervalId);
// app.startTimer();

app.tapIn = function() {
    $(".tapInButton").on("click", function(event) {
        event.preventDefault();

        app.startTimer();
    });
};

app.startGame = function() {
    $(".startButton").on("click", function(event) {
        event.preventDefault();
        
        // Hide start prompt
        $(".startPrompt").css("display", "none");

        // Start next timer
        app.startTimer();
    });
};





// App init method
app.init = function() {
    this.startGame();
};



// Start app
$("document").ready(function() {
    app.init();
});