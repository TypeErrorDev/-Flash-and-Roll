const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is connected!" });
});

// Database test endpoint
app.get("/api/test-db", (req, res) => {
  db.get("SELECT sqlite_version()", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Database is connected!",
      sqliteVersion: row["sqlite_version()"],
    });
  });
});

app.post("/app/scores", (req, res));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
