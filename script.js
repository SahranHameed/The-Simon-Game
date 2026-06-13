// Simon Game - Boss Level Challenge 02

var gamePattern = [];
var userClickedPattern = [];
var started = false;
var level = 0;

var buttonColors = ["red", "blue", "green", "yellow"];

// Sound frequencies for each color
var sounds = {
  red:    440,
  blue:   330,
  green:  260,
  yellow: 392
};

// ─── Start game on any keypress ───────────────────────────────
$(document).keypress(function () {
  if (!started) {
    startGame();
  }
});

// Also allow tap/click on mobile to start
$(document).on("click", function (e) {
  if (!started && !$(e.target).hasClass("simon-btn")) {
    startGame();
  }
});

function startGame() {
  started = true;
  level = 0;
  gamePattern = [];
  $(".level-display").text("Level " + level);
  $("#status-msg").text("Watch the pattern...").removeClass("game-over success");
  nextSequence();
}

// ─── Next level sequence ──────────────────────────────────────
function nextSequence() {
  userClickedPattern = [];
  level++;
  $(".level-display").text("Level " + level);
  $("#level-num").text(level);
  $("#status-msg").text("Watch the pattern...").removeClass("game-over success");

  var randomColor = buttonColors[Math.floor(Math.random() * 4)];
  gamePattern.push(randomColor);

  // Play the full sequence with delay
  var delay = 600;
  gamePattern.forEach(function (color, index) {
    setTimeout(function () {
      flashButton(color);
      playSound(color);
    }, delay * (index + 1));
  });

  // Enable user input after sequence
  setTimeout(function () {
    $("#status-msg").text("Your turn! Repeat the pattern.");
    enableButtons();
  }, delay * (gamePattern.length + 1));
}

// ─── Flash a button ───────────────────────────────────────────
function flashButton(color) {
  $("#" + color).addClass("active-" + color);
  setTimeout(function () {
    $("#" + color).removeClass("active-" + color);
  }, 400);
}

// ─── Play sound using Web Audio API ──────────────────────────
function playSound(color) {
  var context = new (window.AudioContext || window.webkitAudioContext)();
  var oscillator = context.createOscillator();
  var gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.frequency.value = sounds[color];
  oscillator.type = "sine";
  gainNode.gain.setValueAtTime(0.4, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.5);
}

// ─── Enable / Disable buttons ─────────────────────────────────
function enableButtons() {
  $(".simon-btn").css("pointer-events", "auto");
}

function disableButtons() {
  $(".simon-btn").css("pointer-events", "none");
}

// ─── User button click ────────────────────────────────────────
$(".simon-btn").on("click", function () {
  var userChosenColor = $(this).attr("id");

  userClickedPattern.push(userChosenColor);
  playSound(userChosenColor);

  $(this).addClass("pressed");
  var self = this;
  setTimeout(function () {
    $(self).removeClass("pressed");
  }, 150);

  checkAnswer(userClickedPattern.length - 1);
});

// ─── Check answer ─────────────────────────────────────────────
function checkAnswer(currentLevel) {
  if (userClickedPattern[currentLevel] !== gamePattern[currentLevel]) {
    // Wrong answer
    gameOver();
  } else {
    // Correct so far
    if (userClickedPattern.length === gamePattern.length) {
      // Completed this level
      disableButtons();
      $("#status-msg").text("✅ Correct! Next level loading...").addClass("success");
      setTimeout(function () {
        nextSequence();
      }, 1200);
    }
  }
}

// ─── Game Over ────────────────────────────────────────────────
function gameOver() {
  disableButtons();
  started = false;

  // Flash red background
  $("body").addClass("game-over-flash");
  setTimeout(function () {
    $("body").removeClass("game-over-flash");
  }, 500);

  // Play wrong buzz sound
  playWrongSound();

  $(".level-display").text("Game Over! Press Any Key to Restart");
  $("#status-msg").text("❌ Wrong! You reached Level " + level).addClass("game-over");
  $("#level-num").text(0);
  level = 0;
  gamePattern = [];
}

// ─── Wrong answer buzz sound ──────────────────────────────────
function playWrongSound() {
  var context = new (window.AudioContext || window.webkitAudioContext)();
  var oscillator = context.createOscillator();
  var gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.frequency.value = 100;
  oscillator.type = "sawtooth";
  gainNode.gain.setValueAtTime(0.5, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.8);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.8);
}
