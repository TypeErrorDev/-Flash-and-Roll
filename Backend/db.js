const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("leaderboard.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");

    // Create leaderboard table if it doesn't exist
    db.run(
      `
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                score INTEGER NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `,
      (err) => {
        if (err) {
          console.error("Error creating table:", err);
        } else {
          console.log("Leaderboard table ready");
        }
      }
    );
  }
});

module.exports = db;
