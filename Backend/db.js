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
          console.error("Error creating leaderboard table:", err);
        } else {
          console.log("Leaderboard table ready");
        }
      }
    );

    // Create users table if it doesn't exist
    db.run(
      `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                displayName TEXT NOT NULL
            )
        `,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err);
        } else {
          console.log("Users table ready");
        }
      }
    );

    // Create decks table if it doesn't exist
    db.run(
      `
            CREATE TABLE IF NOT EXISTS decks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                name TEXT NOT NULL,
                category TEXT,
                flashcards TEXT,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `,
      (err) => {
        if (err) {
          console.error("Error creating decks table:", err);
        } else {
          console.log("Decks table ready");
        }
      }
    );
  }
});

module.exports = db;
