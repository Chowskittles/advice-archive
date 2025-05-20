// Import necessary packages
const express = require("express");              // Express is the web server framework
const { MongoClient } = require("mongodb");      // MongoClient lets us talk to our MongoDB database
const cors = require("cors");                    // CORS lets the frontend safely talk to the backend
const path = require("path");                    // path is used to work with file paths
require("dotenv").config();                      // dotenv loads environment variables from .env (like our DB password)

const app = express();                           // Create the Express app
const PORT = process.env.PORT || 3000;           // Use the port from the environment (Glitch/Heroku) or 3000 locally

// Middleware setup
app.use(cors());                                 // Allow requests from other places (like your frontend)
app.use(express.json());                         // Automatically parse incoming JSON
app.use(express.static("public"));               // Serve the frontend files (HTML/CSS/JS) from the "public" folder

const uri = process.env.MONGO_URI;               // Load the MongoDB URI from the .env file
const client = new MongoClient(uri);             // Create a client to talk to MongoDB
let entriesCollection;                           // We'll store a reference to the database collection here

// Connect to MongoDB and start the server
async function start() {
  try {
    await client.connect();                      // Connect to the database
    console.log("✅ Connected to MongoDB");

    const db = client.db("adviceArchive");       // Use (or create) a database named "adviceArchive"
    entriesCollection = db.collection("entries");// Use (or create) a collection named "entries"

    app.listen(PORT, () => {                     // Start the server on the desired port
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err); // Log connection error if it happens
  }
}

start(); // Call the function to get everything started

// GET /entries — Fetch and return all saved advice entries
app.get("/entries", async (req, res) => {
  try {
    const entries = await entriesCollection
      .find()                                    // Get all documents from the collection
      .sort({ timestamp: -1 })                   // Sort them by time (newest first)
      .toArray();                                // Turn the results into an array

    res.json(entries);                           // Send the list of entries back to the frontend
  } catch (err) {
    console.error("❌ Failed to fetch entries:", err);          // Log any errors
    res.status(500).json({ error: "Could not fetch entries" }); // Send error back to the browser
  }
});

// POST /entries — Accept a new piece of advice and save it
app.post("/entries", async (req, res) => {
  const { text } = req.body;                     // Pull the "text" field from the incoming request

  // Validate the input: must be a non-empty string
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Advice text is required and must be a string." });
  }

  const entry = {
    text: text.trim(),                           // Clean up any leading/trailing spaces
    timestamp: new Date(),                       // Store the current time
  };

  try {
    await entriesCollection.insertOne(entry);    // Save the entry to the database
    res.status(201).json(entry);                 // Send the saved entry back as confirmation
  } catch (err) {
    console.error("❌ Failed to save entry:", err);              // Log save error
    res.status(500).json({ error: "Could not save entry" });    // Respond with error to client
  }
});