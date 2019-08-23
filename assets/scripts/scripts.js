// Declare app
const app = {};

// Initialize starting properties for app
app.score = 0; // score for game
app.taskTime = 25; // in minutes
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

// Function that loops through one full cycle of times
app.startTimer = function() {
    let currentTime = app.cycle[0] * 60000; // converted to milliseconds
    
    const timeToMoveToEnd = app.cycle.shift();
    app.cycle.push(timeToMoveToEnd);

    const intervalId = setInterval(function() {
        if (currentTime) {
            // Increase score and update value on page
            app.score += 1;
            $(".currentScore").text(app.score);

            currentTime -= 10;

            if (currentTime % 1000 === 0) {
                // Decrease timer and update value on page
                let seconds = (currentTime / 1000) % 60;
                seconds = seconds.toString().length === 1 ? "0" + seconds : seconds;
                let minutes = (currentTime / 1000 - seconds) / 60;
                minutes = minutes.toString().length === 1 ? "0" + minutes : minutes;
                $(".timer1").text(`${minutes}:${seconds}`);
            }
        } else {
            clearInterval(intervalId);
            app.startTimer();
        };
    }, 10);
};

app.startGame = function() {
    $(".startButton").on("click", function(event) {
        event.preventDefault();

        $(".plug").toggleClass("plugRight plugLeft");
        $(".activeGameContainer").toggleClass("containerRight containerCenter");
        $(".startPrompt").toggleClass("containerLeft containerCenter");

        setTimeout(function() {
            $(".plug").animate({left: "+=2rem"}, 5.5);
            // $(".activeGameContainer").toggleClass("batteryCharging");
        }, 1320);
        
        Hide start prompt
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