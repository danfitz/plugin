// Declare app
const app = {};

// Initialize starting properties for app
app.score = 0; // score for game
app.currentTime = null; // current time running
app.workBlock = { type: "work", time: 0.05  }; // in minutes
app.shortBreakBlock = { type: "short break", time: 1 }; // in minutes
app.longBreakBlock = { type: "long break", time: 5 }; // in minutes
app.paddingTime = 0.05; // in minutes
app.cycle = [
    app.workBlock,
    app.shortBreakBlock,
    app.workBlock,
    app.shortBreakBlock,
    app.workBlock,
    app.shortBreakBlock,
    app.workBlock,
    app.longBreakBlock
];
app.gameStatus = "off"; // possible values: "off", "on", "warning", "depleting", "paused", "done"
app.batteryIcons = [
    "fa-battery-empty",
    "fa-battery-quarter",
    "fa-battery-half",
    "fa-battery-three-quarters",
    "fa-battery-full"
]
app.buyTimeCost = 100;

// this variable will provide global access to the current setInterval running
app.intervalId = null;

// Method for creating battery charging animation
app.batteryCharging = function () {
    const batteryToEnd = app.batteryIcons.shift();
    app.batteryIcons.push(batteryToEnd);
    $(".battery")
        .removeClass(`${app.batteryIcons[app.batteryIcons.length - 1]} batteryProblem`)
        .addClass(`${app.batteryIcons[0]} batteryCharging`);
}

// Method for creating battery depleting animation
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

    // Extract seconds
    let seconds = (milliseconds / 1000) % 60;
    // Add 0 at beginning of seconds if value is between 0 to 9
    seconds = seconds.toString().length === 1 ? "0" + seconds : seconds;
    // Extract minutes
    let minutes = (milliseconds / 1000 - seconds) / 60;

    // Concatenate minutes and seconds into mm:ss format
    const formattedTime = minutes + ":" + seconds;

    // Insert/update app.currentTime on page
    $(timerSelector).text(formattedTime);
};

// Method that runs through one full unit of time
app.startTimer = function() {
    // Update app properties and content on page when new timer starts
    app.gameStatus = "on"; // Update game status

    const targetBlock = app.cycle.shift(); // remove first element from cycle array
    app.currentTime = targetBlock.time * 60000; // converted to milliseconds
    $(".timerStatus").text(targetBlock.type); // Updates timer status
    app.cycle.push(targetBlock); // push target block to end of cycle array

    app.updateTimer(".timer1 .timerNum", app.currentTime); // Update main timer
    app.updateTimer(".timer2 .timerNum", app.cycle[0].time * 60000); // Update second timer
    app.updateTimer(".timer3 .timerNum", app.cycle[1].time * 60000); // Update third timer
    app.updateTimer(".timer4 .timerNum", app.cycle[2].time * 60000); // Update fourth timer

    $(".timer2 .timerType").text(app.cycle[0].type); // Update second timer
    $(".timer3 .timerType").text(app.cycle[1].type); // Update third timer
    $(".timer4 .timerType").text(app.cycle[2].type); // Update fourth timer
    
    $(".instructions").addClass("visuallyHidden"); // hides any instructions
    
    // At a rapid interval:
    // UPDATE SCORE
    // UPDATE CURRENT TIME
    app.intervalId = setInterval(function() {    
        // As long as timer is greater or equal to the negative value of padding time...
        if (app.currentTime >= app.paddingTime * -60000) {
            // Increase score and update value on page while score is positive
            if (app.currentTime >= 0) {
                app.score += 1;
                $(".score").text(app.score);
                // When timer is negative but within padding time,
            // update game status to "warning" and display messages on page
        } else {
                app.gameStatus = "warning";
                $(".instructions").removeClass("visuallyHidden");
                $(".timerStatus").text("Overtime");
            }
            
            // Otherwise, user has reached "depleting" game status and begins losing score
        } else {
            // Update game status and instructions
            app.gameStatus = "depleting";
            // Update score
            app.score -= 1;
            $(".score").text(app.score);
        };
        
        // Visual signals for game: battery icon, screen colours, etc.
        if (app.currentTime % 500 === 0) {
            if (app.gameStatus === "on") {
                app.batteryCharging();
                $(".activeGameContainer").removeClass("depletingAlert warningAlert");
                $(".nextButton").removeClass("keyboardButtonFlash");
            } else if (app.gameStatus === "warning") {
                $(".battery")
                    .removeClass("batteryCharging")
                    .addClass("batteryProblem");

                $(".instructionsText").text(`You have ${app.paddingTime} minute before you start losing charge...`);
                
                $(".activeGameContainer").addClass("warningAlert");
                $(".nextButton").addClass("keyboardButtonFlash");
            } else if (app.gameStatus === "depleting") {
                app.batteryDepleting();

                $(".instructionsText").text("Tap in to stop losing points...");

                $(".activeGameContainer")
                    .removeClass("warningAlert")
                    .addClass("depletingAlert");
            }
        }
        
        // Decrease timer
        app.currentTime -= 50;
        
        // Update time on page exactly every 1 second
        if (app.currentTime % 1000 === 0) {
            app.updateTimer(".timer1 .timerNum", app.currentTime);
        }
    }, 50);
};

// Event listener for taking user to next time block
app.nextPrompt = function() {
    // For click event
    $(".nextButton").on("click", function() {
        $(".nextButton .keyDescription").text(app.cycle[1].type);
        clearTimeout(app.intervalId);
        app.startTimer();
    });

    // For right arrow key event
    $(document).on("keydown", function(event) {
        if (event.keyCode === 39) {
            $(".nextButton .keyDescription").text(app.cycle[1].type);
            clearTimeout(app.intervalId);
            app.startTimer();
        }
    });
};

// Event listener for buying more time
app.buyTimePrompt = function() {
    // For click event
    $(".buyButton").on("click", function() {
        if (app.score >= app.buyTimeCost) {
            app.score -= app.buyTimeCost;
            app.currentTime += 60000 * 5;
            app.updateTimer(".timer1 .timerNum", Math.round(app.currentTime) - Math.round(app.currentTime) % 1000);
        }
    })

    // For up arrow key event
    $(document).on("keydown", function(event) {
        if (event.keyCode === 38) {
            if (app.score >= app.buyTimeCost) {
                app.score -= app.buyTimeCost;
                app.currentTime += 60000 * 5;
                app.updateTimer(".timer1 .timerNum", Math.round(app.currentTime) - Math.round(app.currentTime) % 1000);
            }   
        }
    })
}

// Event listener that starts the game
app.startGame = function() {
    $(".startButton").on("click", function(event) {
        event.preventDefault();

        $(".nextButton .keyDescription").text(app.cycle[1].type);
        
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
            $(".batteryScoreboard").css("opacity", "1");
            app.startTimer();
        }, 1900);
        
    });
};

// App init method
app.init = function() {
    this.startGame();
    this.nextPrompt();
    this.buyTimePrompt();
};   

// Start app
$("document").ready(function() {
    app.init();
});