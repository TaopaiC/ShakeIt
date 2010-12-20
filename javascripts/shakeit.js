var score = 0;
var old_axis = 0;
var db;
var game_started = false;
var game_start_time;
var start_button;
var goal = 100;
var power_size = 0;

function game_abort() {
  $(".ui-btn-text", start_button).text("Start");
  game_started = false;
  window.removeEventListener("devicemotion", onMotion);
  window.clearInterval(updateGameScore);
}
function game_finish() {
  $(".ui-btn-text", start_button).text("Start");
  game_started = false;
  window.removeEventListener("devicemotion", onMotion);
  window.clearInterval(updateGameScore);
  insertScore(new Date().getTime() - game_start_time, getFormatedNowTime());
}
function game_start() {
  play_sound();
  $(".ui-btn-text", start_button).text("Cancel");
  game_started = true;
  score = 0;
  updateGameScore();
  updateGamePower();
  game_start_time = new Date().getTime();
  window.addEventListener("devicemotion", onMotion);
  window.setInterval(updateGamePower, 200);
}


//  <fieldset class="ui-grid-a">
//    <div class="ui-block-a"><div class="ui-bar ui-bar-e">10:02"</div></div>
//    <div class="ui-block-b"><div class="ui-bar ui-bar-e">2010-10-20 20:30</div></div>
//  </fieldset>
function renderScores(tx, rs) {
  e = $("#scores div[data-role=content]");
  e.empty();

  var r;
  e.append(renderScoreTitle());
  for (var i=0; i < rs.rows.length; i++) {
    r = rs.rows.item(i);
    e.append(renderScore(r['score'], r['created_at']));
  }
}
function renderScoreTitle() {
  var template = '<div class="ui-bar">' +
    '<span class="time"/>' +
    '<span class="created_at"/>' +
  '</div>';
  var fieldset = $(template).find(".time").text("Time").end().find(".created_at").text("Date").end();
  return fieldset;
}
function renderScore(score, created_at) {
  //var template = '<fieldset class="ui-grid-a">' +
  //  '<div class="ui-block-a"><div class="ui-bar ui-bar-e time"></div></div>' +
  //  '<div class="ui-block-b"><div class="ui-bar ui-bar-e created_at"></div></div>' +
  //'</fieldset>'
  var template = '<div class="ui-bar ui-bar-e">' +
    '<span class="time"/>' +
    '<span class="created_at"/>' +
  '</div>';
  var fieldset = $(template).find(".time").text(formatedScore(score)).end().find(".created_at").text(created_at).end();
  return fieldset;
}

function formatedScore(score) {
  var sec  = parseInt(score / 1000, 10) || 0;
  var msec = parseInt(score % 1000, 10) || 0;
  return sec + "'" + msec;
}

function getFormatedNowTime() {
  var now = new Date();
  return now.getFullYear() + "/" + now.getMonth() + "/" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes();
}

function updateGameScore() {
  var score_width = (score / goal * 100) || 0
  $("#game .score").text(score).css("width", score_width.toString() + "%");
}
function updateGamePower() {
  var color = RGB(0, power_size, 0);
  $("#game").css("backgroundImage", "-moz-linear-gradient(center top," + color + ",#222222)");
  $("#game").css("backgroundImage", "-webkit-gradient(linear,left top,left bottom,color-stop(0," + color + "),color-stop(1, #222222))");
  $("#game").css("backgroundColor", color);
}

function play_sound() {
  // var sound = $("#audio").get(0);
  // sound.play();
  var sound = new Audio();
  sound.src = "pong.mp3";
  sound.load();
  sound.play();
}

function react(isPunch, evt) {
  if (isPunch) {
    score++;
    updateGameScore();

    if (score >= goal) {
      game_finish();
      return;
    }
    power_size += 30;
    if (power_size > 255) {power_size = 255;}
  } else {
    power_size -= 5;
    if (power_size < 0) {power_size = 0;}
  }
}

function game_init() {
  initDb();

  $("#game").bind("pageshow", function(event, ui) {
    updateGameScore();
  } ).bind("pagehide", function(event, ui) {
    game_abort();
  } );
  start_button = $("#game #start_game");
  start_button.bind("click", function() {
    if (game_started) {
      game_abort();
    } else {
      game_start();
    }
  } );

  $("#scores").bind("pagebeforeshow", function(event, ui) {
    loadScores(renderScores);
  } ).bind("pagebeforecreate", function(event, ui) {
    loadScores(renderScores);
  } );

  $("#scores a[data-icon=delete]").bind("click", function(event) {
    clearScores(function() {loadScores(renderScores)});
  } );
}
