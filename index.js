const mysql = require("mysql2");
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "urlshortener"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: ", err);
        return;
    }
    console.log("Connected to database");
});

const app = express();
app.use(express.json());
app.use(cors());

// Generate a new URL
app.post("/generate-url", (req, res) => {
    const { message, visibility } = req.body;

    if (!message) {
        return res.json({ error: "Message is required!" });
    }

    const uniqueID = crypto.randomUUID();
    const uniqueURL = `msg-${uniqueID}`;

    const sql = "INSERT INTO urls (url, message, visibility) VALUES (?, ?, ?)";
    db.query(sql, [uniqueURL, message, visibility], (err) => {
        if (err) {
            return res.json({ error: "Database error while saving URL" });
        }
        res.json({ uniqueURL });
    });
});

// Fetch public URLs
app.get("/get-public-urls", (req, res) => {
    const sql = "SELECT url FROM urls WHERE visibility = 'public' ORDER BY id DESC LIMIT 10";
    db.query(sql, (err, results) => {
        if (err) {
            return res.json({ error: "Error fetching public URLs" });
        }
        res.json(results);
    });
});

// Fetch message by URL
app.get("/message/:url", (req, res) => {
    const { url } = req.params;

    const sql = "SELECT message, visibility FROM urls WHERE url = ?";
    db.query(sql, [url], (err, results) => {
        if (err) return res.json({ error: "Database Error" });

        if (results.length === 0) return res.json({ error: "URL Not Found" });

        const { message, visibility } = results[0];

        if (visibility === "private") {
            return res.json({ error: "You don't have access to this message" });
        }

        res.json({ message });
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
