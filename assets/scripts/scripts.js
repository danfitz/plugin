// Declare app
const app = {};

// Initialize starting properties for app
app.score = 0; // score for game
app.taskTime = 0.25; // in minutes
app.shortBreakTime = 5; // in minutes
app.longBreakTime = 20; // in minutes
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

app.updateTimer = function(inputMilliseconds) {
    let milliseconds = inputMilliseconds < 0 ? -inputMilliseconds : inputMilliseconds;

    let seconds = (milliseconds / 1000) % 60;
    seconds = seconds.toString().length === 1 ? "0" + seconds : seconds;
    let minutes = (milliseconds / 1000 - seconds) / 60;
    minutes = minutes.toString().length === 1 ? "0" + minutes : minutes;

    currentTime += minutes + ":" + seconds;
    $(".currentTimer").text(currentTime);
};

// Function that loops through one full cycle of times
app.startTimer = function() {
    let currentTime = app.cycle[0] * 60000; // converted to milliseconds
    app.updateTimer(currentTime);
    
    const timeToMoveToEnd = app.cycle.shift();
    app.cycle.push(timeToMoveToEnd);

    const intervalId = setInterval(function() {
        // Decrease timer
        currentTime -= 10;

        if (currentTime > 0) {
            // Increase score and update value on page
            app.score += 1;
            $(".currentScore").text(app.score);
            if (currentTime % 1000 === 0) {
                app.updateTimer(currentTime);
            }
        
        } else {
            app.score -= 1;
            $(".currentScore").text(app.score);
            if (currentTime % 1000 === 0) {
                app.updateTimer(currentTime);
            }
            // clearInterval(intervalId);
            // app.startTimer();
        };
        
    }, 10);
};

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