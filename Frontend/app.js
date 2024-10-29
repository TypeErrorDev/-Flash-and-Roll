function testBackendConnection() {
  fetch("http://localhost:3000/api/test")
    .then((res) => res.json())
    .then((data) => {
      console.log("Response from backend:", data);
      alert(data.message);
    })
    .catch((err) => {
      console.error("Error testing backend connection:", err);
      alert(
        "Failed to connect to backend. Please ensure the backend server is running."
      );
    });
}

function testDatabaseConnection() {
  fetch("http://localhost:3000/api/test-db")
    .then((res) => res.json())
    .then((data) => {
      console.log("Database response:", data);
      alert(data.message);
    })
    .catch((err) => {
      console.error("Error testing database:", err);
      alert("Failed to connect to database");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  // ===========================
  // DOM Elements Selection
  // ===========================
  const navbar = document.getElementById("navbar");
  const authContainer = document.getElementById("auth-container");
  const settingsContainer = document.getElementById("settings-container");
  const authForm = document.getElementById("auth-form");
  const displayNameInput = document.getElementById("display-name");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const confirmModal = document.getElementById("confirm-modal");
  const addDeckButton = document.getElementById("add-deck-button");
  const saveDeckButton = document.getElementById("save-deck-button");
  const cancelDeckButton = document.getElementById("cancel-deck-button");
  const deckInput = document.getElementById("deck-input");
  const newDeckNameInput = document.getElementById("new-deck-name");
  const flashcardQuestion = document.getElementById("flashcard-question");
  const flashcardAnswer = document.getElementById("flashcard-answer");
  const addFlashcardButton = document.getElementById("add-flashcard-button");
  const flashcardList = document.getElementById("flashcard-list");

  // ===========================
  // Authentication Check
  // ===========================
  let decksContainer;

  const checkAuth = () => {
    console.log("Checking authentication...");
    const user = JSON.parse(localStorage.getItem("user"));
    decksContainer = document.getElementById("decks-container");
    const flashcardContainer = document.getElementById("flashcard-container");
    const settingsContainer = document.getElementById("settings-container");

    if (user) {
      console.log("User authenticated:", user.displayName);
      document.getElementById("user-name").textContent = user.displayName;

      // Load decks from localStorage
      loadDecksFromLocalStorage();

      renderDecks();
      decksContainer.style.display = "block";

      const menu = document.createElement("ul");
      menu.className = "navbar-menu";
      menu.innerHTML = `
            <li id="settings-link">Settings</li>
            <li id="sign-out-link">Sign Out</li>
          `;
      const existingMenu = navbar.querySelector(".navbar-menu");
      if (existingMenu) existingMenu.remove();

      navbar.appendChild(menu);
      authContainer.style.display = "none";
      settingsContainer.style.display = "none";

      navbar.addEventListener("click", (e) => {
        if (e.target.id === "sign-out-link") {
          confirmModal.style.display = "flex";
          document.body.classList.add("blur");
          authContainer.style.display = "none";
          settingsContainer.style.display = "none";
          decksContainer.style.display = "none";
          flashcardContainer.style.display = "none";
        } else if (e.target.id === "settings-link") {
          settingsContainer.style.display = "block";
          flashcardContainer.style.display = "none";
          if (decksContainer) {
            decksContainer.style.display = "none";
          }
        }
      });

      decksContainer.style.display = "block";
      flashcardContainer.style.display = "none";
    } else {
      console.log("No user authenticated");
      const menu = navbar.querySelector(".navbar-menu");
      if (menu) menu.remove();

      authContainer.style.display = "flex";
      settingsContainer.style.display = "none";
      decksContainer.style.display = "none";
      flashcardContainer.style.display = "none";
    }
  };

  // ===========================
  // Render Decks Function
  // ===========================
  let decks = [];

  function loadDecksFromLocalStorage() {
    console.log("Loading decks from localStorage...");
    const storedDecks = localStorage.getItem("decks");
    if (storedDecks) {
      decks = JSON.parse(storedDecks);
      console.log("Loaded decks:", decks);
    } else {
      decks = [];
      console.log("No decks found in localStorage");
    }
  }

  const renderDecks = () => {
    const deckList = document.getElementById("deck-list");
    deckList.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Deck Name</th>
            <th>Category</th>
            <th>Cards</th>
            <th>Total Points</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${decks
            .map(
              (deck, index) => `
            <tr>
              <td><a href="#" class="deck-link" data-deck="${deck.name}">${deck.name}</a></td>
              <td>${deck.category}</td>
              <td>${deck.cardCount}</td>
              <td>${deck.totalPoints}</td>
              <td>
                <button class="edit-btn" data-deck="${deck.name}">Edit</button>
                <button class="delete-btn" data-deck="${deck.name}">Delete</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    // Add event listeners after rendering
    const deleteButtons = deckList.querySelectorAll(".delete-btn");
    const editButtons = deckList.querySelectorAll(".edit-btn");
    const deckLinks = deckList.querySelectorAll(".deck-link");

    deleteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const deckName = button.getAttribute("data-deck");
        if (confirm(`Are you sure you want to delete "${deckName}"?`)) {
          const deckIndex = decks.findIndex((deck) => deck.name === deckName);
          if (deckIndex !== -1) {
            decks.splice(deckIndex, 1);
            saveDeckToLocalStorage();
            renderDecks();
          }
        }
      });
    });

    editButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const deckName = button.getAttribute("data-deck");
        editDeck(deckName);
      });
    });

    deckLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const deckName = link.getAttribute("data-deck");
        startDeck(deckName);
      });
    });
  };

  // ===========================
  // Deck Management Functions
  // ===========================
  const showDeckInput = () => {
    deckInput.style.display = "flex";
    newDeckNameInput.value = "";
  };

  const hideDeckInput = () => {
    deckInput.style.display = "none";
  };

  const saveDeck = () => {
    const deckName = newDeckNameInput.value.trim();
    const category = document.getElementById("deck-category").value.trim();

    if (deckName && currentDeckFlashcards.length > 0 && category) {
      const totalPoints = currentDeckFlashcards.reduce(
        (sum, card) => sum + card.points,
        0
      );

      decks.push({
        name: deckName,
        category: category,
        flashcards: currentDeckFlashcards,
        cardCount: currentDeckFlashcards.length,
        totalPoints: totalPoints,
      });

      saveDeckToLocalStorage();
      renderDecks();

      // Reset form
      deckInput.style.display = "none";
      addDeckButton.style.display = "block";
      newDeckNameInput.value = "";
      document.getElementById("deck-category").value = "";
      currentDeckFlashcards = [];
      updateFlashcardList();
    } else {
      alert("Please enter a deck name, category, and at least one flashcard.");
    }
  };

  const deleteDeck = (deckName) => {
    // Find the deck index
    const deckIndex = decks.findIndex((deck) => deck.name === deckName);

    if (deckIndex !== -1) {
      // Show confirmation dialog
      if (confirm(`Are you sure you want to delete "${deckName}"?`)) {
        // Remove the deck from the array
        decks.splice(deckIndex, 1);

        // Save updated decks to localStorage
        saveDeckToLocalStorage();

        // Re-render the deck list
        renderDecks();
      }
    }
  };

  let currentDeckFlashcards = [];

  addDeckButton.addEventListener("click", () => {
    deckInput.style.display = "block";
    addDeckButton.style.display = "none";
    currentDeckFlashcards = [];
    updateFlashcardList();
  });

  addFlashcardButton.addEventListener("click", () => {
    const question = flashcardQuestion.value.trim();
    const answer = flashcardAnswer.value.trim();
    const points = parseInt(document.getElementById("flashcard-points").value);

    if (question && answer) {
      currentDeckFlashcards.push({
        question,
        answer,
        points,
      });

      // Update the flashcard list display
      updateFlashcardList();

      // Clear inputs
      flashcardQuestion.value = "";
      flashcardAnswer.value = "";
      document.getElementById("flashcard-points").value = "1"; // Reset to default
    }
  });

  function updateFlashcardList() {
    flashcardList.innerHTML = currentDeckFlashcards
      .map(
        (card, index) => `
      <li>
        <div class="flashcard-info">
          <strong>Q: ${card.question}</strong><br>
          A: ${card.answer}<br>
          Points: ${card.points}
        </div>
        <button onclick="removeFlashcard(${index})">Remove</button>
      </li>
    `
      )
      .join("");
  }

  function editFlashcard(index) {
    const card = currentDeckFlashcards[index];
    flashcardQuestion.value = card.question;
    flashcardAnswer.value = card.answer;
    addFlashcardButton.textContent = "Update Flashcard";
    addFlashcardButton.onclick = () => {
      updateFlashcard(index);
    };
  }

  function updateFlashcard(index) {
    const question = flashcardQuestion.value.trim();
    const answer = flashcardAnswer.value.trim();
    if (question && answer) {
      currentDeckFlashcards[index] = { question, answer };
      flashcardQuestion.value = "";
      flashcardAnswer.value = "";
      updateFlashcardList();
      addFlashcardButton.textContent = "Add Flashcard";
      addFlashcardButton.onclick = addFlashcard;
    }
  }

  function deleteFlashcard(index) {
    currentDeckFlashcards.splice(index, 1);
    updateFlashcardList();
  }

  saveDeckButton.addEventListener("click", () => {
    const deckName = newDeckNameInput.value.trim();
    if (deckName && currentDeckFlashcards.length > 0) {
      const existingDeckIndex = decks.findIndex((d) => d.name === deckName);
      const newDeck = {
        name: deckName,
        flashcards: currentDeckFlashcards,
        cardCount: currentDeckFlashcards.length,
        category: "General",
      };

      if (existingDeckIndex !== -1) {
        // Update existing deck
        decks[existingDeckIndex] = newDeck;
      } else {
        // Add new deck
        decks.push(newDeck);
      }

      saveDeckToLocalStorage();
      renderDecks();
      deckInput.style.display = "none";
      addDeckButton.style.display = "block";
      newDeckNameInput.value = "";
      currentDeckFlashcards = [];
      updateFlashcardList();

      // Reset the save button text if it was changed
      saveDeckButton.textContent = "Save Deck";
    }
  });

  cancelDeckButton.addEventListener("click", () => {
    deckInput.style.display = "none";
    addDeckButton.style.display = "block";
    newDeckNameInput.value = "";
    currentDeckFlashcards = [];
    updateFlashcardList();
  });

  function saveDeckToLocalStorage() {
    console.log("Saving decks to localStorage:", decks);
    localStorage.setItem("decks", JSON.stringify(decks));
  }

  // ===========================
  // Open Flashcards Function
  // ===========================

  const openFlashcards = (deckName) => {
    const decksContainer = document.getElementById("decks-container");
    const flashcardContainer = document.getElementById("flashcard-container");

    // Find the selected deck
    const selectedDeck = decks.find((deck) => deck.name === deckName);
    if (!selectedDeck || !selectedDeck.flashcards.length) return;

    let currentCardIndex = 0;
    const questionText = document.getElementById("question-text");
    let showingQuestion = true;

    // Function to display current flashcard
    const showCurrentCard = () => {
      const currentCard = selectedDeck.flashcards[currentCardIndex];
      questionText.textContent = showingQuestion
        ? currentCard.question
        : currentCard.answer;
    };

    // Function to return to deck list
    const returnToDeckList = () => {
      flashcardContainer.style.display = "none";
      decksContainer.style.display = "block";
    };

    // Show first card
    showCurrentCard();

    decksContainer.style.display = "none";
    flashcardContainer.style.display = "block";

    document.getElementById("close-flashcard").onclick = returnToDeckList;

    document.getElementById("skip-flashcard").onclick = () => {
      currentCardIndex++;
      if (currentCardIndex >= selectedDeck.flashcards.length) {
        returnToDeckList();
        return;
      }
      showingQuestion = true;
      showCurrentCard();
    };

    document.getElementById("flip-flashcard").onclick = () => {
      showingQuestion = !showingQuestion;
      showCurrentCard();
    };

    document.getElementById("next-flashcard").onclick = () => {
      currentCardIndex++;
      if (currentCardIndex >= selectedDeck.flashcards.length) {
        returnToDeckList();
        return;
      }
      showingQuestion = true;
      showCurrentCard();
    };
  };

  // ===========================
  // Navbar Event Listeners
  // ===========================
  const addNavbarEventListeners = () => {
    const menu = navbar.querySelector(".navbar-menu");
    if (menu) {
      menu.addEventListener("click", (e) => {
        if (e.target.id === "sign-out-link") {
          confirmModal.style.display = "flex";
          document.body.classList.add("blur");
          authContainer.style.display = "none";
          settingsContainer.style.display = "none";
          decksContainer.style.display = "none";
          flashcardContainer.style.display = "none";
        } else if (e.target.closest("#settings-link")) {
          settingsContainer.style.display = "block";
          flashcardContainer.style.display = "none";
          decksContainer.style.display = "none";
        }
      });
    }
  };

  // ===========================
  // Settings Event Listeners
  // ===========================
  const addSettingsEventListeners = () => {
    const settingsContainer = document.getElementById("settings-container");
    decksContainer = document.getElementById("decks-container"); // Define decksContainer here

    if (settingsContainer) {
      const goHomeLink = document.getElementById("go-home-link");
      if (goHomeLink) {
        goHomeLink.addEventListener("click", () => {
          console.log("Go Home clicked");
          settingsContainer.style.display = "none";
          if (decksContainer) {
            decksContainer.style.display = "block";
          } else {
            console.error("decksContainer not found");
          }
        });
      }

      const editDecksBtn = document.getElementById("edit-decks");
      if (editDecksBtn) {
        editDecksBtn.addEventListener("click", () => {
          console.log("Edit decks clicked");
        });
      }

      const resetDecksBtn = document.getElementById("reset-decks");
      if (resetDecksBtn) {
        resetDecksBtn.addEventListener("click", () => {
          const confirmReset = confirm(
            "Are you sure you want to reset all decks?"
          );
          if (confirmReset) {
            localStorage.removeItem("decks");
            console.log("All decks have been reset.");
            renderDecks();
          }
        });
      }
    }
  };

  // ===========================
  // Authentication Form Submission
  // ===========================
  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const displayName = displayNameInput.value;
    localStorage.setItem("user", JSON.stringify({ displayName }));
    checkAuth();
  });

  // ===========================
  // Theme Management
  // ===========================
  const updateTheme = (isDark) => {
    document.body.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  const savedTheme = localStorage.getItem("theme") || "light";
  themeToggle.checked = savedTheme === "dark";
  updateTheme(savedTheme === "dark");

  themeIcon.addEventListener("click", () => {
    themeToggle.checked = !themeToggle.checked;
    const isDark = themeToggle.checked;
    updateTheme(isDark);
  });

  themeToggle.addEventListener("change", (e) => {
    updateTheme(e.target.checked);
  });

  // ===========================
  // Confirm Modal Actions
  // ===========================
  document.getElementById("confirm-yes").addEventListener("click", () => {
    console.log("Clearing all data...");
    localStorage.clear();
    confirmModal.style.display = "none";
    alert("Local storage cleared. You have been signed out.");
    const flashcardContainer = document.getElementById("flashcard-container");
    flashcardContainer.style.display = "none";
    decks = [];
    checkAuth();
  });

  document.getElementById("confirm-no").addEventListener("click", () => {
    console.log("Signing out without clearing data...");
    confirmModal.style.display = "none";
    alert("You have been signed out. Your data remains.");
    localStorage.removeItem("user");
    const flashcardContainer = document.getElementById("flashcard-container");
    flashcardContainer.style.display = "none";
    checkAuth();
  });

  document.getElementById("confirm-cancel").addEventListener("click", () => {
    confirmModal.style.display = "none";
    document.body.classList.remove("blur");
  });

  // ===========================
  // Initial Check
  // ===========================
  loadDecksFromLocalStorage();
  renderDecks();
  checkAuth();

  // Make sure to call this function after the DOM is loaded
  addSettingsEventListeners();

  // Move editDeck function inside the DOMContentLoaded scope
  function editDeck(deckName) {
    const deck = decks.find((d) => d.name === deckName);
    if (!deck) return;

    currentDeckFlashcards = [...deck.flashcards];
    newDeckNameInput.value = deck.name;
    deckInput.style.display = "block";
    addDeckButton.style.display = "none";
    updateFlashcardList();

    // Change the save button to update instead of create
    saveDeckButton.textContent = "Update Deck";
    const originalSaveFunction = saveDeckButton.onclick;

    saveDeckButton.onclick = () => {
      const newDeckName = newDeckNameInput.value.trim();
      if (newDeckName && currentDeckFlashcards.length > 0) {
        const deckIndex = decks.findIndex((d) => d.name === deckName);
        if (deckIndex !== -1) {
          decks[deckIndex] = {
            name: newDeckName,
            flashcards: currentDeckFlashcards,
            cardCount: currentDeckFlashcards.length,
            category: decks[deckIndex].category,
          };
          saveDeckToLocalStorage();
          renderDecks();
          deckInput.style.display = "none";
          addDeckButton.style.display = "block";
          newDeckNameInput.value = "";
          currentDeckFlashcards = [];
          updateFlashcardList();

          // Reset the save button
          saveDeckButton.textContent = "Save Deck";
          saveDeckButton.onclick = originalSaveFunction;
        }
      }
    };
  }

  // Add this function to fetch and display scores
  const updateLeaderboard = () => {
    fetch("http://localhost:3000/api/scores")
      .then((res) => res.json())
      .then((scores) => {
        const leaderboardBody = document.getElementById("leaderboard-body");
        leaderboardBody.innerHTML = scores
          .map(
            (score, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${score.username}</td>
              <td>${score.score}</td>
              <td>${new Date(score.date).toLocaleDateString()}</td>
            </tr>
          `
          )
          .join("");
      })
      .catch((err) => console.error("Error fetching scores:", err));
  };

  // Add this to your initialization code
  updateLeaderboard();

  // Add this function to submit a new score
  const submitScore = (score) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.displayName) {
      console.error("No user logged in");
      return;
    }

    fetch("http://localhost:3000/api/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user.displayName,
        score: score,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        updateLeaderboard(); // Refresh the leaderboard
        console.log(`Score submitted for ${user.displayName}: ${score}`);
      })
      .catch((err) => console.error("Error submitting score:", err));
  };

  // Add this to test score submission
  const testButton = document.createElement("button");
  testButton.textContent = "Test Score Submission";
  testButton.onclick = () => submitScore(Math.floor(Math.random() * 100));
  document.body.appendChild(testButton);
});
