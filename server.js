const express = require("express");              // web server framework
const { MongoClient } = require("mongodb");      // mongoclient allows for communication with MongoDB database
const cors = require("cors");                    // cors lets the frontend talk to backend
const path = require("path");                    // to work with file paths
require("dotenv").config();                      // dotenv loads environment variables from .env (like the mongodb password)

const app = express();                           // creates express app – framework for web servers and route handling (get/post etc)
const PORT = process.env.PORT || 3000;           // to use the port from the environment (glitch) or locally on 3000

// middleware setup
app.use(cors());                                 // allow requests from other places (frontend)
app.use(express.json());                         // automatically parse incoming JSON
app.use(express.static("public"));               // serves the frontend files (HTML/CSS/JS) from the "public" folder

const uri = process.env.MONGO_URI;               // Load the MongoDB uri from the .env file
const client = new MongoClient(uri);             // create a client to talk to MongoDB
let entriesCollection;                           // reference to the database collection here

// connect to MongoDB and start the server
async function start() {
  try {
    await client.connect();                      // connect to the database
    console.log("✅ Connected to MongoDB");

    const db = client.db("adviceArchive");       // Use/create a database named "adviceArchive"
    entriesCollection = db.collection("entries");// Use/create a collection named "entries"

    app.listen(PORT, () => {                     // starts the server on the desired port
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err); // log connection error if it happens
  }
}

start(); // call function to start

// GET /entries — fetch and return all saved advice entries
app.get("/entries", async (req, res) => {
  try {
    const entries = await entriesCollection
      .find()                                    // get all documents from the collection
      .sort({ timestamp: -1 })                   // sorts them by time (newest first)
      .toArray();                                // turns the results into an array

    res.json(entries);                           // send the list of entries back to the frontend
  } catch (err) {
    console.error("❌ Failed to fetch entries:", err);          // log any errors
    res.status(500).json({ error: "Could not fetch entries" }); // sends error back to the browser
  }
});

// POST /entries — accept a new piece of advice, save it
app.post("/entries", async (req, res) => {
  const { text } = req.body;                     // pull the "text" field from the incoming request

  // validate the input: MUST be a non-empty string - nobody likes empty advice!
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Advice text is required and must be a string." });
  }

  const entry = {
    text: text.trim(),                           // clean up any leading/trailing spaces
    timestamp: new Date(),                       // store the current time
  };

  try {
    await entriesCollection.insertOne(entry);    // save the entry to the database
    res.status(201).json(entry);                 // send the saved entry back as confirmation
  } catch (err) {
    console.error("❌ Failed to save entry:", err);              // log save error
    res.status(500).json({ error: "Could not save entry" });    // respond with error to client
  }
});
