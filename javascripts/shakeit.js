function ShakeIt(config) {
  this.config      = config;
  this.scores_page = config["scores_page"];
  this.game_page   = config["game_page"];
  this.goal        = config["goal"];
  this.db          = config["db"];

  this.score           = 0;
  this.old_axis        = 0;
  this.game_started    = false;
  this.game_start_time;
  this.start_button;
  this.shake_db;
  this.power_size      = 0;
  this.devicemotionFunction    = null;
  this.updateGamePowerFunction = null;
  this.old_axis;
}

ShakeIt.prototype = {
  game_abort: function() {
    $(".ui-btn-text", this.start_button).text("Start");
    this.game_started = false;
    window.removeEventListener("devicemotion", this.devicemotionFunction);
    window.clearInterval(this.updateGamePowerFunction);
  },
  game_finish: function() {
    $(".ui-btn-text", this.start_button).text("Start");
    this.game_started = false;
    window.removeEventListener("devicemotion", this.devicemotionFunction);
    window.clearInterval(this.updateGamePowerFunction);
    this.shake_db.insertScore(new Date().getTime() - this.game_start_time, this.getFormatedNowTime());
  },
  game_start: function() {
    this.play_sound();
    $(".ui-btn-text", this.start_button).text("Cancel");
    this.game_started = true;
    this.score = 0;
    this.updateGameScore();
    this.updateGamePower();
    this.game_start_time = new Date().getTime();

    var that = this;
    this.devicemotionFunction    = function(evt) {  that.onMotion(evt)  };
    window.addEventListener("devicemotion", this.devicemotionFunction );
    this.updateGamePowerFunction = window.setInterval(function() { that.updateGamePower(); }, 200);
  },
  onMotion: function(evt) {
    var x = evt.accelerationIncludingGravity.x;
    var y = evt.accelerationIncludingGravity.y;
    var z = evt.accelerationIncludingGravity.z;
  
    var axis = x;
  
    if (Math.abs(axis) > 10 && (Math.abs(this.old_axis - axis) > 5)) {
      this.react(true, evt);
    } else {
      this.react(false, evt);
    }
    this.old_axis = axis;
  },
  refreshScores: function() {
    var that = this;
    this.shake_db.loadScores(function(tx, rs) { that.renderScores(tx, rs); });
  },
 
  //  <fieldset class="ui-grid-a">
  //    <div class="ui-block-a"><div class="ui-bar ui-bar-e">10:02"</div></div>
  //    <div class="ui-block-b"><div class="ui-bar ui-bar-e">2010-10-20 20:30</div></div>
  //  </fieldset>
  renderScores: function(tx, rs) {
    e = $("div[data-role=content]", this.scores_page);
    e.empty();
  
    var r;
    e.append(this.renderScoreTitle());
    for (var i=0; i < rs.rows.length; i++) {
      r = rs.rows.item(i);
      e.append(this.renderScore(r['score'], r['created_at']));
    }
  },
  renderScoreTitle: function() {
    var template = '<div class="ui-bar">' +
      '<span class="time"/>' +
      '<span class="created_at"/>' +
    '</div>';
    var fieldset = $(template).find(".time").text("Time").end().find(".created_at").text("Date").end();
    return fieldset;
  },
  renderScore: function(score, created_at) {
    //var template = '<fieldset class="ui-grid-a">' +
    //  '<div class="ui-block-a"><div class="ui-bar ui-bar-e time"></div></div>' +
    //  '<div class="ui-block-b"><div class="ui-bar ui-bar-e created_at"></div></div>' +
    //'</fieldset>'
    var template = '<div class="ui-bar ui-bar-e">' +
      '<span class="time"/>' +
      '<span class="created_at"/>' +
    '</div>';
    var fieldset = $(template).find(".time").text(this.formatedScore(score)).end().find(".created_at").text(created_at).end();
    return fieldset;
  },
  formatedScore: function(score) {
    var sec  = parseInt(score / 1000, 10) || 0;
    var msec = parseInt(score % 1000, 10) || 0;
    return sec + "'" + msec;
  },
  getFormatedNowTime: function() {
    var now = new Date();
    return now.getFullYear() + "/" + now.getMonth() + "/" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes();
  },
  updateGameScore: function() {
    var score_width = (this.score / this.goal * 100) || 0
    $(".score", this.game_page).text(this.score).css("width", score_width.toString() + "%");
  },
  updateGamePower: function() {
    var color = RGB(0, this.power_size, 0);
    $(this.game_page).css("backgroundImage", "-moz-linear-gradient(center top," + color + ",#222222)");
    $(this.game_page).css("backgroundImage", "-webkit-gradient(linear,left top,left bottom,color-stop(0," + color + "),color-stop(1, #222222))");
    $(this.game_page).css("backgroundColor", color);
  },
  play_sound: function() {
    // var sound = $("#audio").get(0);
    // sound.play();
    var sound = new Audio();
    sound.src = "pong.mp3";
    sound.load();
    sound.play();
  },
  
  react: function(isPunch, evt) {
    if (isPunch) {
      this.score++;
      this.updateGameScore();
  
      if (this.score >= this.goal) {
        this.game_finish();
        return;
      }
      this.power_size += 30;
      if (this.power_size > 255) { this.power_size = 255; }
    } else {
      this.power_size -= 5;
      if (this.power_size < 0) { this.power_size = 0; }
    }
  },
  game_init: function() {
    this.shake_db = new ShakeDB();
    this.shake_db.init();

    var that = this;
    $(this.game_page).bind("pageshow", function(event, ui) {
      that.updateGameScore();
    } ).bind("pagehide", function(event, ui) {
      that.game_abort();
    } );
    this.start_button = $("#start_game", this.game_page);
    this.start_button.bind("click", function() {
      if (that.game_started) {
        that.game_abort();
      } else {
        that.game_start();
      }
    } );
  
    $(this.scores_page).bind("pagebeforeshow", function(event, ui) {
      that.refreshScores();
    } ).bind("pagebeforecreate", function(event, ui) {
      that.refreshScores();
    } );
  
    $("a[data-icon=delete]", this.scores_page).bind("click", function(event) {
      that.shake_db.clearScores(function() { that.refreshScores(); });
    } );
  }
};
