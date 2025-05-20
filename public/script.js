// Grab references to important HTML elements so we can use them in JavaScript
const form = document.getElementById("adviceForm");      // The form where users will type and submit advice
const input = document.getElementById("adviceInput");    // The textarea where the user types their message
const entriesDiv = document.getElementById("entries");   // The section where all submitted advice will be displayed

// This function loads all the advice entries that have already been submitted and saved in the database
async function loadEntries() {
  try {
    // Make a GET request to the server to fetch all existing advice
    const res = await fetch("/entries");

    // Convert the response into usable JavaScript data (a list of advice)
    const entries = await res.json();

    // Clear anything currently in the display area so we don’t double the entries
    entriesDiv.innerHTML = "";

    // For each piece of advice returned from the server:
    entries.forEach((entry) => {
      const div = document.createElement("div");    // Create a new <div> to hold the entry
      div.className = "entry";                      // Give it a class so it can be styled with CSS

      // Add the advice text and a timestamp formatted nicely
      div.innerHTML = `
        <p>${entry.text}</p>
        <small>${new Date(entry.timestamp).toLocaleString()}</small>
      `;

      // Add this new entry div to the page so it appears in the list
      entriesDiv.appendChild(div);
    });

  } catch (err) {
    // If something goes wrong while getting the data, log an error to the console
    console.error("Error loading entries:", err);
  }
}

// This listens for when the user submits the form
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Stop the default form behavior (which would refresh the page)

  const text = input.value.trim();  // Get the value the user typed and remove extra whitespace
  if (!text) return;                // If the user didn’t type anything, exit early and do nothing

  try {
    // Send a POST request to the server to add the new piece of advice
    const res = await fetch("/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },   // Tell the server we’re sending JSON
      body: JSON.stringify({ text }),                    // Convert the text into JSON format
    });

    // If the server says it was successful:
    if (res.ok) {
      input.value = "";     // Clear the textarea after submission
      loadEntries();        // Reload the list to include the new advice
    } else {
      // If the server had a problem, show a popup alert
      alert("Something went wrong. Try again.");
    }

  } catch (err) {
    // If something goes wrong sending the data, log the error to the console
    console.error("Error submitting advice:", err);
  }
});

// Automatically run the loadEntries function as soon as the page loads,
// so users immediately see all the existing advice
loadEntries();
