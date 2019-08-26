// Declare app
const app = {};

// Initialize starting properties for app
app.score = 0; // score for game
app.currentTime = null; // current time running (will be in milliseconds)
app.workBlock = { type: "work", time: 25  }; // in minutes
app.shortBreakBlock = { type: "short break", time: 5 }; // in minutes
app.longBreakBlock = { type: "long break", time: 15 }; // in minutes
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

// This variable will provide global access to the current setInterval running
// Useful for stopping a currently-running timer
app.intervalId = null;

// For tracking state of game
app.gameStatus = "off"; // possible values: "off", "on", "warning", "depleting", "done"
app.paused = false;

// Static values for buying time
app.buyTime = 5; // in minutes
app.buyTimeCost = 20000;

// Font Awesome icon classes for battery animations
app.batteryIcons = [
    "fa-battery-empty",
    "fa-battery-quarter",
    "fa-battery-half",
    "fa-battery-three-quarters",
    "fa-battery-full"
];

// Method for adding commas to large numbers
app.numbersWithCommas = function(targetNumber) {
    return targetNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Method for creating battery charging animation
app.batteryCharging = function () {
    $(".battery")
        .removeClass(`${app.batteryIcons[app.batteryIcons.length - 1]} batteryProblem`)
        .addClass(`${app.batteryIcons[0]} batteryCharging`);
    const batteryToEnd = app.batteryIcons.shift();
    app.batteryIcons.push(batteryToEnd);
};

// Method for creating battery depleting animation
app.batteryDepleting = function () {
    $(".battery")
        .removeClass(`${app.batteryIcons[0]} batteryCharging`)
        .addClass(`${app.batteryIcons[app.batteryIcons.length - 1]} batteryProblem`);
    const batteryToEnd = app.batteryIcons.pop();
    app.batteryIcons.unshift(batteryToEnd);
};

// Method that converts milliseconds to mm:ss and inserts value on page
app.updateTimer = function(timerSelector, inputMilliseconds) {
    // Convert input time to positive number if negative
    const milliseconds = inputMilliseconds < 0 ? -inputMilliseconds : inputMilliseconds;

    // Extract seconds
    let seconds = (milliseconds / 1000) % 60;
    // Add 0 at beginning of seconds if value is between 0 to 9
    seconds = seconds.toString().length === 1 ? "0" + seconds : seconds;
    // Extract minutes
    let minutes = (milliseconds / 1000 - seconds) / 60;

    // Concatenate minutes and seconds into mm:ss format
    const formattedTime = minutes + ":" + seconds;

    // Insert/update formattedTime on page
    $(timerSelector).text(formattedTime);
};

// Method that makes initial required changes when timer starts
app.setupTimer = function() {
    app.gameStatus = "on"; // Update game status

    const targetBlock = app.cycle.shift(); // remove first element from cycle array
    app.currentTime = targetBlock.time * 60000; // converted to milliseconds
    app.cycle.push(targetBlock); // push target block to end of cycle array

    // Updates 4 timers' values and types on page
    $(".timerStatus").text(targetBlock.type); // 1st
    app.updateTimer(".timerNum1", app.currentTime); // 1st
    app.updateTimer(".timerNum2", app.cycle[0].time * 60000); // 2nd
    $(".timerType2").text(app.cycle[0].type); // 2nd
    app.updateTimer(".timerNum3", app.cycle[1].time * 60000); // 3rd
    $(".timerType3").text(app.cycle[1].type); // 3rd
    app.updateTimer(".timerNum4", app.cycle[2].time * 60000); // 4th
    $(".timerType4").text(app.cycle[2].type); // 4th

    $(".instructions").css("display", "none"); // hides any instructions
};

// Method that runs through one full unit of time
app.startTimer = function() {
    app.setupTimer();

    app.intervalId = setInterval(function() {
        
        // If game isn't paused...
        if (!app.paused) {
            
            // Decrease timer
            app.currentTime -= 50;

            // Update current timer on page exactly every 1 second
            if (app.currentTime % 1000 === 0) {
                app.updateTimer(".timerNum1", app.currentTime);
            }

            // As long as timer is greater or equal to the negative value of padding time...
            if (app.currentTime >= app.paddingTime * -60000) {
                
                // Increase score and update value on page while score is positive
                if (app.currentTime >= 0) {
                    app.score += 1;
                    $(".score").text(app.numbersWithCommas(app.score));

                // When timer is negative but within padding time,
                // update game status to "warning" and display messages on page
                } else {
                    if (app.gameStatus !== "warning") {
                        app.gameStatus = "warning";
                        $(".instructions").css("display", "flex");
                        $(".instructionsText").text(`${app.paddingTime} minute(s) until score drops...`);
                        $(".timerStatus").text("Overtime");
                    }
                }
            
            // Otherwise, user has reached "depleting" game status and begins losing points
            } else {
                // Update game status and instructions
                if (app.gameStatus !== "depleting") {
                    app.gameStatus = "depleting";
                    $(".instructionsText").text("Start next timer to stop losing points...");
                }
                // Update score value and display on page
                app.score -= 1;
                $(".score").text(app.numbersWithCommas(app.score));
            };
            
            // Visual signals for game: battery icon, screen colours, etc.
            if (app.currentTime % 500 === 0) {

                // Signals for "on" status
                if (app.gameStatus === "on") {
                    // Battery charging animation
                    app.batteryCharging();
                    // Remove screen colours
                    $(".activeGameContainer").removeClass("depletingAlert warningAlert");
                    // Remove next button flash
                    $(".nextButton").removeClass("keyboardButtonFlash");

                // Signals for "warning" status
                } else if (app.gameStatus === "warning") {
                    // Remove battery charging animation and change colour
                    $(".battery")
                        .removeClass("batteryCharging")
                        .addClass("batteryProblem");
                    // Add yellow warning colour on screen 
                    $(".activeGameContainer").addClass("warningAlert");
                    // Add next button flash
                    $(".nextButton").addClass("keyboardButtonFlash");

                // Signals for "depleting" status
                } else if (app.gameStatus === "depleting") {
                    // Battery depleting animation
                    app.batteryDepleting();
                    // Add red flashing colour on screen
                    $(".activeGameContainer")
                        .removeClass("warningAlert")
                        .addClass("depletingAlert");
                }
            }
        }
    }, 50);
};

// Event listener for taking user to next time block
app.nextPrompt = function() {
    // For click event
    $(".nextButton").on("click", function() {
        // Remove flashing next button
        $(".nextButton").removeClass("keyboardButtonFlash");
        // Display upcoming timer type in next button
        $(".nextButton .keyDescription").text(app.cycle[1].type);
        // End old timer and start new one
        clearTimeout(app.intervalId);
        app.startTimer();
    });
    
    // For right arrow key event
    $(document).on("keydown", function(event) {
        if (event.keyCode === 39) {
            // Display upcoming timer type in next button
            $(".nextButton .keyDescription").text(app.cycle[1].type);
            // End old timer and start new one
            clearTimeout(app.intervalId);
            app.startTimer();
        };
    });
};

// Event listener for buying more time
app.buyTimePrompt = function() {
    // For click event
    $(".buyButton").on("click", function() {
        // Increase timer if user has enough points to buy more time
        if (app.score >= app.buyTimeCost) {
            app.score -= app.buyTimeCost;
            app.currentTime += app.buyTime * 60000; // in milliseconds
            app.updateTimer(".timerNum1", Math.round(app.currentTime) - Math.round(app.currentTime) % 1000);
            
            // If buying time takes time into a positive value, update status of game to "on" and remove any warning signals 
            if (app.currentTime >= 0) {
                app.gameStatus = "on";
                $(".instructions").css("display", "none");
                $(".timerStatus").text(app.cycle[app.cycle.length - 1].type);
            }
        
        // Display error message if user doesn't have enough points to buy more time
        } else {
            $(".instructions").css("display", "flex");
            const amountToBuy = app.numbersWithCommas(app.buyTimeCost-app.score);
            $(".instructionsText").text(`You need ${amountToBuy} more points to buy time`);
        };
    });

    // For up arrow key event
    $(document).on("keydown", function(event) {
        if (event.keyCode === 38) {
            // Increase timer if user has enough points to buy more time
            if (app.score >= app.buyTimeCost) {
                app.score -= app.buyTimeCost;
                app.currentTime += app.buyTime * 60000; // in milliseconds
                app.updateTimer(".timerNum1", Math.round(app.currentTime) - Math.round(app.currentTime) % 1000);

                // If buying time takes time into a positive value, update status of game to "on" and remove any warning signals 
                if (app.currentTime >= 0) {
                    app.gameStatus = "on";
                    $(".instructions").css("display", "none");
                    $(".timerStatus").text(app.cycle[app.cycle.length - 1].type);
                }

            // Display error message if user doesn't have enough points to buy more time
            } else {
                $(".instructions").css("display", "flex");
                const amountToBuy = app.numbersWithCommas(app.buyTimeCost - app.score);
                $(".instructionsText").text(`You need ${amountToBuy} more points to buy time`);
            };
        };
    });
};

// Event listener for pausing and unpausing game
app.pausePrompt = function() {
    // For click events
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

    // For when user clicks the letter "p" on keyboard
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

// Event listener for ending game
app.shutdownPrompt = function() {
    $(".shutdownButton").on("click", function() {

        // Confirm if user wants to end game first
        if (confirm("Are you sure you want to shut down?")) {
            app.gameStatus = "done";
            clearInterval(app.intervalId);
    
            // Display CTA at the end of game:
            // 1. Final score
            // 2. Tweet button
            // 3. Restart button
            const shutdownHtml = `
                <div.shutdownCTA>
                    <h1 class="appTitle">Plugin</h1>
                    <p>Your final score: ${app.score}</p>
                    <a href="https://twitter.com/intent/tweet?text=I%20just%20got%20a%20score%20of%20${app.score}%20using%20the%20Plugin%20app%20to%20help%20me%20stay%20productive!&via=_danielfitz&url=https://plugin.danielfitz.com" class="twitter-share-button" data-show-count="false" data-size="large">Tweet</a>
                    <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
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

// Event listener for restart button
app.restartPrompt = function() {
    $("main").on("click", ".restartButton", function() {
        location.reload();
    });
};

// Event listener that starts the game
app.startGame = function() {
    $(".startButton").on("click", function(event) {
        event.preventDefault();

        // Updates next button text to upcoming timer
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
            $(".appScreenTitle").removeClass("visuallyHidden"); // unhides screen logo
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