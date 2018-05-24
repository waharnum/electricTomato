// Makes testing easier
// var MINUTE_MULTIPLIER = 1;
var MINUTE_MULTIPLIER = 0.2;

// Global timerState management object

var timerState = {
    timerId: null,
    currentSeconds: null,
    isPaused: false,
    type: null
};

// Global tracking of pomodoro states
var pomoState = {
    "Pomodoro": 0,
    "Short Break": 0,
    "Long Break": 0
};

// Global strings for types of timer

var timerTypeStrings = {
    noTimer: "No Timer",
    pomodoro: "Pomodoro",
    shortBreak: "Short Break",
    longBreak: "Long Break"
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
    var displayedSeconds = secondsRemainder === 0 ? "00" : secondsRemainder;
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
};

bindTimerClick("pomodoro", 25 * MINUTE_MULTIPLIER, timerTypeStrings.pomodoro);
bindTimerClick("shortBreak", 5 * MINUTE_MULTIPLIER, timerTypeStrings.shortBreak);
bindTimerClick("longBreak", 15 * MINUTE_MULTIPLIER, timerTypeStrings.longBreak);
setPauseResumeText();
bindPauseResumeClick();
