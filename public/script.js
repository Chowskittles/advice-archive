// grab references to important HTML elements for use in JavaScript
const form = document.getElementById("adviceForm");      // the form where users type and submit advice
const input = document.getElementById("adviceInput");    // the textarea where the user types their message
const entriesDiv = document.getElementById("entries");   // the section where all submitted advice is displayed

// this function loads all the advice entries that have already been submitted and saved in the database
async function loadEntries() {
  try {
    // make GET request to the server to fetch all existing advice
    const res = await fetch("/entries");

    // convert the response into usable JavaScript data (a list of advice)
    const entries = await res.json();

    // clear anything currently in the display area so there aren't double entries
    entriesDiv.innerHTML = "";

    // for each piece of advice returned from the server:
    entries.forEach((entry) => {
      const div = document.createElement("div");    // create a new HTML <div> to hold the entry
      div.className = "entry";                      // give it a class so it can be styled with CSS

      // add the advice text and a timestamp formatted nicely
      div.innerHTML = `
        <p>${entry.text}</p>
        <small>${new Date(entry.timestamp).toLocaleString()}</small>
      `;

      // add this new entry div to the page so it appears in the list
      entriesDiv.appendChild(div);
    });

  } catch (err) {
    // if something goes wrong while getting the data, log an error to the console
    console.error("Error loading entries:", err);
  }
}

// this listens for when the user submits the form
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop the default form behavior (which would refresh the page)

  const text = input.value.trim();  // get the value the user typed, remove extra whitespace
  if (!text) return;                // if the user didn’t type anything, exit early and do nothing

  try {
    // send a POST request to the server to add the new piece of advice
    const res = await fetch("/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },   // tells the server JSON is being sent
      body: JSON.stringify({ text }),                    // convert text into JSON format
    });

    // if the server says it was successful:
    if (res.ok) {
      input.value = "";     // clear the textarea after submission
      loadEntries();        // reload the list to include the new advice
    } else {
      // if the server had a problem, show a popup alert
      alert("Something went wrong. Try again.");
    }

  } catch (err) {
    // if something goes wrong sending the data, log the error to the console
    console.error("Error submitting advice:", err);
  }
});

// automatically run the loadEntries function as soon as the page loads,
// so users immediately see all the existing advice
loadEntries();
