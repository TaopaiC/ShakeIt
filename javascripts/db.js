function ShakeDB() {
  this.db;
}

ShakeDB.prototype = {
  init: function(callback) {
    var that = this;
    try {
      if (window.openDatabase) {
        this.db = openDatabase("twetbar", "1.0", "HTML 5 Device Motion Example", 200000);
        if (this.db) {
          this.db.transaction(function(tx) {
  	    tx.executeSql("CREATE TABLE IF NOT EXISTS Scores (id REAL UNIQUE, score INT, created_at TEXT);", [], callback, that.sqlFailed);
          } );
        } else {
          console.error("error occurred trying to open DB");
        }
      } else {
        console.error("web Databases not supported");
      }
    } catch(e) {
      console.error("error occurred during DB init, Web Database supported?");
    }
  },
  sqlFailed:function(tx, err) {
    console.error("SQL Transaction Failed. Message: " + err.message);
  },
  insertScore: function(score, time, callback) {
    var that = this;
    this.db.transaction(function(tx) {
      tx.executeSql('INSERT INTO Scores (score, created_at) VALUES (?, ?);', [score, time], callback, that.sqlFailed);
    } );
  },
  loadScores:function(callback) {
    var that = this;
    this.db.transaction(function(tx) {
      tx.executeSql('SELECT * FROM Scores;', [], callback, that.sqlFailed);
    } );
  },
  clearScores:function(callback) {
    var that = this;
    this.db.transaction(function(tx) {
      tx.executeSql('DELETE FROM Scores;', [], null, that.sqlFailed);
    } );
    this.init(callback);
  }
}

