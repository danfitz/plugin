// Declare app
const app = {};

// Initialize starting properties for app
app.score = 0; // score for game
app.currentTime = null; // current time running
app.taskTime = 0.05; // in minutes
app.shortBreakTime = 5; // in minutes
app.longBreakTime = 20; // in minutes
app.paddingTime = 0.05; // in minutes
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
app.gameStatus = "off"; // possible values: "off", "on", "warning", "depleting", "paused", "done"
app.batteryIcons = [
    "fa-battery-empty",
    "fa-battery-quarter",
    "fa-battery-half",
    "fa-battery-three-quarters",
    "fa-battery-full"
]

// this variable will provide global access to the current setInterval running
app.intervalId = null;

// Methods for updating battery icon
app.batteryCharging = function () {
    const batteryToEnd = app.batteryIcons.shift();
    app.batteryIcons.push(batteryToEnd);
    $(".battery")
        .removeClass(`${app.batteryIcons[app.batteryIcons.length - 1]} batteryProblem`)
        .addClass(`${app.batteryIcons[0]} batteryCharging`);
}
app.batteryDepleting = function () {
    const batteryToEnd = app.batteryIcons.pop();
    app.batteryIcons.unshift(batteryToEnd);
    $(".battery")
        .removeClass(`${app.batteryIcons[0]} batteryCharging`)
        .addClass(`${app.batteryIcons[app.batteryIcons.length - 1]} batteryProblem`);
}

// Method that converts milliseconds to mm:ss and inserts value on page
app.updateTimer = function(timerSelector, inputMilliseconds) {
    // Convert input time to positive number if negative
    let milliseconds = inputMilliseconds < 0 ? -inputMilliseconds : inputMilliseconds;
    let formattedTime = inputMilliseconds < 0 ? "-" : "";

    // Extract seconds
    let seconds = (milliseconds / 1000) % 60;
    // Add 0 at beginning of seconds if value is between 0 to 9
    seconds = seconds.toString().length === 1 ? "0" + seconds : seconds;
    // Extract minutes
    let minutes = (milliseconds / 1000 - seconds) / 60;
    // Add 0 at beginning of minutes if value is between 0 to 9
    minutes = minutes.toString().length === 1 ? "0" + minutes : minutes;

    // Concatenate minutes and seconds into mm:ss format
    formattedTime += minutes + ":" + seconds;

    // Insert/update app.currentTime on page
    $(timerSelector).text(formattedTime);
};

// Method that runs through one full unit of time
app.startTimer = function() {
    app.currentTime = app.cycle[0] * 60000; // converted to milliseconds
    app.updateTimer(".timer1", app.currentTime); // Initialize start time
    // app.batteryCharging(); // Initialize battery charging icon
    
    // Move chosen time to end of cycle array
    const timeToMoveToEnd = app.cycle.shift();
    app.cycle.push(timeToMoveToEnd);
    
    // At a rapid interval:
    // 1. Update current time
    // 2. Update score
    app.intervalId = setInterval(function() {
        // Decrease timer
        app.currentTime -= 20;
        
        // Update time on page exactly every 1 second
        if (app.currentTime % 1000 === 0) {
            app.updateTimer(".timer1", app.currentTime);
            
        }
        
        // Increase score and update value on page as long as time is positive
        if (app.currentTime >= app.paddingTime * -60000) {
            // 
            if (app.currentTime >= 0) {
                // When timer goes into padding time, flash screen yellow and make icon battery grey
                app.score += 1;
                $(".currentScore").text(app.score);
            } else {
                app.gameStatus = "warning";
            }

        // Otherwise, user is in overtime and score decreases
        } else {
            app.gameStatus = "depleting";
            app.score -= 1;
            $(".currentScore").text(app.score);
        };

        // Visual signal of game status: battery icon and screen
        if (app.currentTime % 500 === 0) {
            if (app.gameStatus === "on") {
                app.batteryCharging();
                $(".activeGameContainer").removeClass("depletingAlert tapInAlert");
            } else if (app.gameStatus === "warning") {
                $(".battery")
                    .removeClass("batteryCharging")
                    .addClass("batteryProblem");
    
                $(".activeGameContainer").addClass("tapInAlert");
            } else if (app.gameStatus === "depleting") {
                app.batteryDepleting();
                $(".activeGameContainer")
                    .removeClass("tapInAlert")
                    .addClass("depletingAlert");
            }
        }
    }, 20);
};

// Tap in button
app.tapIn = function() {
    $(".tapInButton").on("click", function(event) {
        event.preventDefault();
        
        clearTimeout(app.intervalId);
        app.gameStatus = "on";
        app.startTimer();
        app.batteryCharging();
        
        //
    });
};

// Event listener that starts the game
app.startGame = function() {
    $(".startButton").on("click", function(event) {
        event.preventDefault();
        
        // Adds class transition animations
        $(".plug").toggleClass("plugRight plugLeft");
        $(".activeGameContainer").toggleClass("containerRight containerCenter");
        $(".startPrompt").toggleClass("containerLeft containerCenter");
        
        // Runs plug in motion after animations above end
        setTimeout(function() {
            $(".plug").addClass("plugInMotion");
            
            // Hide start prompt
            $(".startPrompt").css("display", "none");
        }, 1400);
        
        // Starts game when plug has been plugged in
        setTimeout(function() {
            app.startTimer();
            app.gameStatus = "on";
        }, 1900);
        
    });
};
  
// App init method
app.init = function() {
    this.startGame();
    this.tapIn();
};   

// Start app
$("document").ready(function() {
    app.init();
});