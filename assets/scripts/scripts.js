// Declare app
const app = {};

// Initialize starting properties for app
app.score = 0; // score for game
app.currentTime = null; // current time running
app.workBlock = { type: "work", time: 25  }; // in minutes
app.shortBreakBlock = { type: "short break", time: 5 }; // in minutes
app.longBreakBlock = { type: "long break", time: 20 }; // in minutes
app.paddingTime = 1; // in minutes
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
app.gameStatus = "off"; // possible values: "off", "on", "warning", "depleting", "done"
app.paused = false;
app.batteryIcons = [
    "fa-battery-empty",
    "fa-battery-quarter",
    "fa-battery-half",
    "fa-battery-three-quarters",
    "fa-battery-full"
]
app.buyTimeCost = 20000;

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
        // Only execute if game isn't paused...
        if (!app.paused) {
            // As long as timer is greater or equal to the negative value of padding time...
            if (app.currentTime >= app.paddingTime * -60000) {
                // Increase score and update value on page while score is positive
                if (app.currentTime >= 0) {
                    app.score += 1;
                    $(".score").text(app.score);
                    // When timer is negative but within padding time,
                // update game status to "warning" and display messages on page
            } else {
                if (app.gameStatus !== "warning") {
                    app.gameStatus = "warning";
                    $(".instructions").removeClass("visuallyHidden");
                    $(".instructionsText").text(`${app.paddingTime} minute(s) until score drops...`);
                    $(".timerStatus").text("Overtime");
                }
            }
            
            // Otherwise, user has reached "depleting" game status and begins losing score
            } else {
                // Update game status and instructions
                if (app.gameStatus !== "depleting") {
                    app.gameStatus = "depleting";
                    $(".instructionsText").text("Start next timer to stop losing points...");
                }
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
    
                    $(".activeGameContainer").addClass("warningAlert");
                    $(".nextButton").addClass("keyboardButtonFlash");
                } else if (app.gameStatus === "depleting") {
                    app.batteryDepleting();
    
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

            if (app.currentTime >= 0) {
                $(".instructions").addClass("visuallyHidden");
            }
        } else {
            $(".instructions").removeClass("visuallyHidden");
            $(".instructionsText").text("Not enough points to buy time");
        };
    });

    // For up arrow key event
    $(document).on("keydown", function(event) {
        if (event.keyCode === 38) {
            if (app.score >= app.buyTimeCost) {
                app.score -= app.buyTimeCost;
                app.currentTime += 60000 * 5;
                app.updateTimer(".timer1 .timerNum", Math.round(app.currentTime) - Math.round(app.currentTime) % 1000);

                if (app.currentTime >= 0) {
                    $(".instructions").addClass("visuallyHidden");
                }
            } else {
                $(".instructions").removeClass("visuallyHidden");
                $(".instructionsText").text("Not enough points to buy time");
            };
        };
    });
};

app.pausePrompt = function() {
    $(".pauseButton").on("click", function() {
        if (!app.paused) {
            app.paused = true;
            $(".pauseButton .keyDescription").text("Unpause");
            $(".pauseButton").addClass("keyboardButtonFlash");
        } else {
            app.paused = false;
            $(".pauseButton .keyDescription").text("Pause");
            $(".pauseButton").removeClass("keyboardButtonFlash");
        };
    });

    $(document).on("keydown", function(event) {
        if (event.keyCode === 80) {
            if (!app.paused) {
                app.paused = true;
                $(".pauseButton .keyDescription").text("Unpause");
                $(".pauseButton").addClass("keyboardButtonFlash");
            } else {
                app.paused = false;
                $(".pauseButton .keyDescription").text("Pause");
                $(".pauseButton").removeClass("keyboardButtonFlash");
            };
        };
    });
};

app.shutdownPrompt = function() {
    $(".shutdownButton").on("click", function() {
        if (confirm("Are you sure you want to shut down?")) {
            app.gameStatus = "done";
            clearInterval(app.intervalId);
    
            const shutdownHtml = `
                <div.shutdownCTA>
                    <h1 class="appTitle">Plugin</h1>
                    <p>Your final score: ${app.score}</p>
                    <a href="https://twitter.com/intent/tweet?text=I%20just%20got%20a%20score%20of%20${app.score}%20using%20the%20Plugin%20app%20to%20help%20me%20stay%20productive!&via=_danielfitz&url=https://plugin.danielfitz.com" class="twitter-share-button" data-show-count="false">Tweet</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
                    <button class="restartButton keyboardButton">
                        <i class="fas fa-redo key" aria-hidden="true"></i>
                        <span class="sr-only">Restart</span>
                        <span class="keyDescription">Restart</span>
                    </button>
                </div>
                `;

            $("main").html(shutdownHtml);
        };
    });
}

app.restartPrompt = function() {
    $("main").on("click", ".restartButton", function() {
        console.log("restart");
        location.reload();
    });
};

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
        }, 1550);
        
        // Starts game when plug has been plugged in
        setTimeout(function() {
            $(".batteryScoreboard").removeClass("visuallyHidden"); // unhides scoreboard
            app.startTimer();
        }, 2000);     
    });
};

// App init method
app.init = function() {
    this.startGame();
    this.nextPrompt();
    this.buyTimePrompt();
    this.pausePrompt();
    this.shutdownPrompt();
    this.restartPrompt();
};   

// Start app
$("document").ready(function() {
    app.init();
});