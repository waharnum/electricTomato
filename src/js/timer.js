// Makes testing easier by increasing speed
// of timer countdown
// var SECONDS_IN_MINUTE = 0.25;
var SECONDS_IN_MINUTE = 60;

// Global tracking of pomodoro states
var pomoState = {
    "Pomodoro": 0,
    "Short Break": 0,
    "Long Break": 0
};

// Global timerState management object

var timerState = {
    timerId: null,
    currentSeconds: null,
    isPaused: false,
    type: null,
    next: function() {
        getNext(pomoState);
    }
};

// Global strings for types of timer

var timerTypeStrings = {
    noTimer: "No Timer",
    pomodoro: "Pomodoro",
    shortBreak: "Short Break",
    longBreak: "Long Break"
};

// Figure out the "next" action per the
// official pomodoro system
var getNext = function (pomoState) {
    var numberPomodoro = pomoState["Pomodoro"];
    var numberShortBreak = pomoState["Short Break"];
    var numberLongBreak = pomoState["Long Break"];

    if(numberPomodoro > 0 && numberPomodoro % 4 === 0) {
        return "Long Break"
    }

    if(numberPomodoro <= numberShortBreak) {
        return "Pomodoro";
    }
    if(numberPomodoro > numberShortBreak) {
        return "Short Break"
    }
};

var getKeyByValue = function (object, value) {
  return Object.keys(object).find(key => object[key] === value);
};

var setPauseResumeText = function () {
    if(timerState.isPaused) {
        $("#pauseResume").text("Resume");
    } else {
        $("#pauseResume").text("Pause");
    }
};

var setNextText = function () {
    $("#next").text(getNext(pomoState));
};

var startTimer = function (seconds) {
    window.clearTimeout(timerState.timerId);
    var countdown = $("#countdown");
    countdown.text(formatTimer(seconds));
    timerState.currentSeconds = seconds;
    timerState.timerId = window.setTimeout(decreaseTimer, 1000);
    timerState.isPaused = false;
    setPauseResumeText();
};

var pauseTimer = function () {
    window.clearTimeout(timerState.timerId);
    timerState.isPaused = true;
    setPauseResumeText();
};

var resumeTimer = function () {
    startTimer(timerState.currentSeconds);
    setPauseResumeText();
};

var bindTimerClick = function (id, seconds, typeString) {
    $("#"+id).click(function (e) {
        $("#next").text("Timing...");
        startTimer(seconds);
        timerState.type = typeString;
        e.preventDefault();
    });
};

var bindPauseResumeClick = function () {
    $("#pauseResume").click(function (e) {
        console.log(timerState.isPaused);
        if(! timerState.isPaused) {
            console.log("pause");
            pauseTimer();
        }
        else if(timerState.isPaused) {
            console.log("resume");
            resumeTimer();
        }
        e.preventDefault();
    });
};

// Given a number of seconds, returns a timer minutes/seconds representation
var formatTimer = function (seconds) {
    var minutes = Math.floor(seconds / 60);
    var secondsRemainder = seconds % 60;
    var displayedSeconds = secondsRemainder < 10 ? "0" + secondsRemainder : secondsRemainder;
    return minutes + ":" + displayedSeconds;
};

var decreaseTimer = function () {
    var countdown = $("#countdown");
    timerState.currentSeconds--;
    countdown.text(formatTimer(timerState.currentSeconds));
    if(timerState.currentSeconds > 0) {
        timerState.timerId = window.setTimeout(decreaseTimer, 1000);
    } else {
        var currentType = timerState.type;
        new Notification("Countdown Complete", {title: "Timer Done", body: currentType + " is finished"});
        var utterance = new SpeechSynthesisUtterance(currentType + " is finished");
        window.speechSynthesis.speak(utterance);

        updatePomoState(timerState.type);

        timerState.type = timerTypeStrings.noTimer;
    }
};

var updatePomoState = function (type) {
    pomoState[type]++;
    var pomoTypeKey = getKeyByValue(timerTypeStrings, type);
    var counterSelector = "#" + pomoTypeKey + "-count";
    var counterDisplay = $(counterSelector);
    var currentCount = parseInt(counterDisplay.text());
    counterDisplay.text(currentCount + 1);
    setNextText();
};

bindTimerClick("pomodoro", 25 * SECONDS_IN_MINUTE, timerTypeStrings.pomodoro);

bindTimerClick("shortBreak", 5 * SECONDS_IN_MINUTE, timerTypeStrings.shortBreak);

bindTimerClick("longBreak", 15 * SECONDS_IN_MINUTE, timerTypeStrings.longBreak);


setPauseResumeText();

setNextText();

bindPauseResumeClick();
