function initDb(callback) {
  try {
    if (window.openDatabase) {
      db = openDatabase("twetbar", "1.0", "HTML 5 Device Motion Example", 200000);
      if (db) {
        db.transaction(function(tx) {
	  tx.executeSql("CREATE TABLE IF NOT EXISTS Scores (id REAL UNIQUE, score INT, created_at TEXT)", [], callback);
        } );
      } else {
        // error occurred trying to open DB
      }
    } else {
      // web Databases not supported
    }
  } catch(e) {
    // error occurred during DB init, Web Database supported?
  }
}
function insertScore(score, time, callback) {
  db.transaction(function(tx) {
    tx.executeSql('INSERT INTO Scores (score, created_at) VALUES (?, ?)', [score, time], callback);
  } );
}
function loadScores(callback) {
  db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM Scores', [], callback);
  } );
}
function clearScores(callback) {
  db.transaction(function(tx) {
    tx.executeSql('DROP TABLE Scores', []);
  } );
  initDb(callback);
}
