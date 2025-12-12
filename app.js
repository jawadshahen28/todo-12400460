// File: js/app.js
// Student: Jawad Shaheen (12400460)
// This file is intentionally incomplete.
// Your task is to implement the required behaviour using JavaScript and the Fetch API.

/*
  API ENDPOINTS (already implemented on the server):

  Base URL:
    http://portal.almasar101.com/assignment/api

  1) Add task  (POST)
     add.php?stdid=STUDENT_ID&key=API_KEY
     Body (JSON): { "title": "Task title" }
     Returns JSON with the added task.

  2) Get tasks (GET)
     get.php?stdid=STUDENT_ID&key=API_KEY
     - If "id" is omitted: returns all tasks for this student.
     - If "id=NUMBER" is provided: returns one task.

  3) Delete task (GET or DELETE)
     delete.php?stdid=STUDENT_ID&key=API_KEY&id=TASK_ID
     Deletes the task with that ID for the given student.
*/

// Configuration for this student (do not change STUDENT_ID value)
const STUDENT_ID = "12400460";
const API_KEY = "nYs43u5f1oGK9";
const API_BASE = "https://portal.almasar101.com/assignment/api";

// Grab elements from the DOM
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const statusDiv = document.getElementById("status");
const list = document.getElementById("task-list");

/**
 * Helper to update status message.
 */
function setStatus(message, isError = false) {
  if (!statusDiv) return;
  statusDiv.textContent = message || "";
  statusDiv.style.color = isError ? "#d9363e" : "#666666";
}

/**
 * Render a single task item with delete button
 */
/**
 * TODO 1:
 * When the page loads, fetch all existing tasks for this student using:
 *   GET: API_BASE + "/get.php?stdid=" + STUDENT_ID + "&key=" + API_KEY
 * Then:
 *   - Parse the JSON response.
 *   - Loop over the "tasks" array (if it exists).
 *   - For each task, create an <li> with class "task-item"
 *     and append it to #task-list.
 */
function renderTask(task) {
  if (!task.id) {
    console.error("Task object missing id:", task);
    return;
  }

  const li = document.createElement("li");
  li.className = "task-item";
  li.setAttribute("data-task-id", task.id);

  const titleSpan = document.createElement("span");
  titleSpan.textContent = task.title || "Untitled";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete-btn";

  // Add click event for deleting the task
  /**
   * TODO 2:
   * When the form is submitted:
   *   - prevent the default behaviour.
   *   - read the value from #task-input.
   *   - send a POST request using fetch to:
   *       API_BASE + "/add.php?stdid=" + STUDENT_ID + "&key=" + API_KEY
   *     with headers "Content-Type: application/json"
   *     and body JSON: { title: "..." }
   *   - on success, add the new task to the DOM and clear the input.
   */
  deleteBtn.addEventListener("click", async function () {
    try {
      setStatus("Deleting task...");

      const response = await fetch(
        `${API_BASE}/delete.php?stdid=${STUDENT_ID}&key=${API_KEY}&id=${task.id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success || data.message === "Task deleted") {
        li.remove();
        setStatus("Task deleted successfully");
      } else {
        setStatus(
          "Failed to delete task: " + (data.message || "Unknown error"),
          true
        );
      }
    } catch (error) {
      setStatus("Error deleting task: " + error.message, true);
      console.error("Delete error:", error);
    }
  });

  li.appendChild(titleSpan);
  li.appendChild(deleteBtn);
  list.appendChild(li);

  return li;
}

document.addEventListener("DOMContentLoaded", async function () {
  try {
    setStatus("Loading tasks...");

    const response = await fetch(
      `${API_BASE}/get.php?stdid=${STUDENT_ID}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.tasks && Array.isArray(data.tasks)) {
      // Clear existing list
      list.innerHTML = "";

      // Render each task
      data.tasks.forEach((task) => {
        renderTask(task);
      });

      setStatus(`Loaded ${data.tasks.length} task(s)`);
    } else if (data.task) {
      list.innerHTML = "";
      renderTask(data.task);
      setStatus("Loaded 1 task");
    } else {
      setStatus("No tasks found");
    }
  } catch (error) {
    setStatus("Error loading tasks: " + error.message, true);
    console.error("Load error:", error);
  }
});

/**
 * Handle form submission to add new task
 */

/**
 * TODO 3:
 * For each task that you render, create a "Delete" button.
 * When clicked:
 *   - send a request to:
 *       API_BASE + "/delete.php?stdid=" + STUDENT_ID + "&key=" + API_KEY + "&id=" + TASK_ID
 *   - on success, remove that <li> from the DOM.
 *
 * You can create a helper function like "renderTask(task)" that:
 *   - Creates <li>, <span> for title, and a "Delete" <button>.
 *   - Attaches a click listener to the delete button.
 *   - Appends the <li> to #task-list.
 */

// Suggested helper (you can modify it or make your own):
if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const taskTitle = input.value.trim();

    if (!taskTitle) {
      setStatus("Please enter a task title", true);
      return;
    }

    try {
      setStatus("Adding task...");

      const response = await fetch(
        `${API_BASE}/add.php?stdid=${STUDENT_ID}&key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: taskTitle }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.task) {
        // Add the new task to the DOM
        renderTask(data.task);

        // Clear the input
        input.value = "";

        setStatus("Task added successfully");
      } else {
        setStatus(
          "Failed to add task: " + (data.message || "Unknown error"),
          true
        );
      }
    } catch (error) {
      setStatus("Error adding task: " + error.message, true);
      console.error("Add error:", error);
    }
  });
}
