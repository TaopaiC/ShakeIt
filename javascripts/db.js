function ShakeDB() {
  var db;
  var self;
}

ShakeDB.prototype = {
  init: function(callback) {
    self = this;

    console.debug("init 1");
    try {
      if (window.openDatabase) {
        self.db = openDatabase("twetbar", "1.0", "HTML 5 Device Motion Example", 200000);
        if (self.db) {
          self.db.transaction(function(tx) {
            console.debug("init transaction");
  	    tx.executeSql("CREATE TABLE IF NOT EXISTS Scores (id REAL UNIQUE, score INT, created_at TEXT)", [], callback);
          } );
        } else {
          console.debug("error occurred trying to open DB");
        }
      } else {
        console.debug("web Databases not supported");
      }
    } catch(e) {
      console.debug("error occurred during DB init, Web Database supported?");
    }
    console.debug("init 3");
  },
  insertScore: function(score, time, callback) {
    self.db.transaction(function(tx) {
      tx.executeSql('INSERT INTO Scores (score, created_at) VALUES (?, ?)', [score, time], callback);
    } );
  },
  loadScores:function(callback) {
    console.debug("loadScores 1");
    console.dir(callback);
    self.db.transaction(function(tx) {
      var backcall = callback;
      console.dir(callback);
      console.debug("loadScores transaction");
      tx.executeSql('SELECT * FROM Scores', [], backcall);
    } );
    console.debug("loadScores 3");
  },
  clearScores:function(callback) {
    console.debug("clearScores 1");
    self.db.transaction(function(tx) {
      console.debug("clearScores transaction");
      tx.executeSql('DROP TABLE Scores', []);
    } );
    console.debug("clearScores 3");
    self.init(callback);
    console.debug("clearScores 4");
  }
}

