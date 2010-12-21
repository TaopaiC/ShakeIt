function ShakeDB() {
  var db;
  var self;
}

ShakeDB.prototype = {
  init: function(callback) {
    self = this;

    try {
      if (window.openDatabase) {
        self.db = openDatabase("twetbar", "1.0", "HTML 5 Device Motion Example", 200000);
        if (self.db) {
          self.db.transaction(function(tx) {
  	    tx.executeSql("CREATE TABLE IF NOT EXISTS Scores (id REAL UNIQUE, score INT, created_at TEXT);", [], callback, self.sqlFailed);
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
    self.db.transaction(function(tx) {
      tx.executeSql('INSERT INTO Scores (score, created_at) VALUES (?, ?);', [score, time], callback, self.sqlFailed);
    } );
  },
  loadScores:function(callback) {
    self.db.transaction(function(tx) {
      tx.executeSql('SELECT * FROM Scores;', [], callback, self.sqlFailed);
    } );
  },
  clearScores:function(callback) {
    self.db.transaction(function(tx) {
      tx.executeSql('DELETE FROM Scores;', [], null, self.sqlFailed);
    } );
    self.init(callback);
  }
}

