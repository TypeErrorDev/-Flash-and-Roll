document.addEventListener("DOMContentLoaded", () => {
  let currentScore = 0;
  let totalPossibleScore = 0;
  let currentCardIndex = 0;
  let currentDeck = "";
  let isShowingQuestion = true;

  // ===========================
  // Default Deck cards
  // ===========================
  const DEFAULT_DECK = {
    name: "JavaScript Info",
    category: "JavaScript",
    flashcards: [
      {
        question: "What is the difference between let and var?",
        answer: "block scope vs function scope",
        points: 2,
      },
      {
        question: "What is a closure in JavaScript?",
        answer: "function with access to outer scope",
        points: 3,
      },
      {
        question: "What is the purpose of 'use strict'?",
        answer: "catches coding mistakes",
        points: 1,
      },
      {
        question: "What is the difference between == and ===?",
        answer: "type coercion vs strict equality",
        points: 2,
      },
      {
        question: "What is a Promise in JavaScript?",
        answer: "handles async operations",
        points: 3,
      },
    ],
    cardCount: 5,
    totalPoints: 11,
  };

  // Then define DOM elements
  const DOM = {
    navbar: document.getElementById("navbar"),
    auth: {
      container: document.getElementById("auth-container"),
      form: document.getElementById("auth-form"),
      displayNameInput: document.getElementById("display-name"),
    },
    deck: {
      container: document.getElementById("decks-container"),
      input: document.getElementById("deck-input"),
      nameInput: document.getElementById("new-deck-name"),
      addButton: document.getElementById("add-deck-button"),
      saveButton: document.getElementById("save-deck-button"),
      cancelButton: document.getElementById("cancel-deck-button"),
      list: document.getElementById("deck-list"),
    },
    flashcard: {
      container: document.getElementById("flashcard-container"),
      question: document.getElementById("flashcard-question"),
      answer: document.getElementById("flashcard-answer"),
      addButton: document.getElementById("add-flashcard-button"),
      list: document.getElementById("flashcard-list"),
    },
    theme: {
      toggle: document.getElementById("theme-toggle"),
      icon: document.getElementById("theme-icon"),
      sunIcon: document.getElementById("sun-icon"),
      moonIcon: document.getElementById("moon-icon"),
    },
    settings: {
      container: document.getElementById("settings-container"),
    },
    leaderboard: {
      container: document.getElementById("leaderboard-container"),
      table: document.getElementById("leaderboard-table"),
      body: document.getElementById("leaderboard-body"),
    },
    modal: {
      confirm: document.getElementById("confirm-modal"),
      yesButton: document.getElementById("confirm-yes"),
      noButton: document.getElementById("confirm-no"),
      cancelButton: document.getElementById("confirm-cancel"),
      message: document.getElementById("confirm-message"),
    },
  };

  // Then define the loadDecksFromLocalStorage function that uses DEFAULT_DECK
  const loadDecksFromLocalStorage = () => {
    const savedDecks = localStorage.getItem("decks");
    if (savedDecks) {
      decks = JSON.parse(savedDecks);
      console.log("Loaded decks:", decks);
    } else {
      // Calculate total points for default deck
      const totalPoints = DEFAULT_DECK.flashcards.reduce(
        (sum, card) => sum + Number(card.points),
        0
      );
      DEFAULT_DECK.totalPoints = totalPoints;

      // Set default deck as the only deck
      decks = [DEFAULT_DECK];

      // Save to localStorage
      localStorage.setItem("decks", JSON.stringify(decks));
      console.log("Created default deck:", decks);
    }
  };

  // Initialize decks array
  let decks = [];

  // ===========================
  // Authentication Check
  // ===========================

  const checkAuth = () => {
    console.log("Checking authentication...");
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      console.log("User authenticated:", user.displayName);
      document.getElementById("user-name").textContent = user.displayName;

      // Load decks from localStorage
      loadDecksFromLocalStorage();

      renderDecks();
      DOM.deck.container.style.display = "block";

      const menu = document.createElement("ul");
      menu.className = "navbar-menu";
      menu.innerHTML = `
            <li id="settings-link">Settings</li>
            <li id="sign-out-link">Sign Out</li>
          `;
      const existingMenu = DOM.navbar.querySelector(".navbar-menu");
      if (existingMenu) existingMenu.remove();

      DOM.navbar.appendChild(menu);
      DOM.auth.container.style.display = "none";
      DOM.settings.container.style.display = "none";

      DOM.navbar.addEventListener("click", (e) => {
        if (e.target.id === "sign-out-link") {
          handleSignOut();
        } else if (e.target.id === "settings-link") {
          DOM.settings.container.style.display = "block";
          DOM.flashcard.container.style.display = "none";
          if (DOM.deck.container) {
            DOM.deck.container.style.display = "none";
          }
        }
      });

      DOM.deck.container.style.display = "block";
      DOM.flashcard.container.style.display = "none";
    } else {
      console.log("No user authenticated");
      const menu = DOM.navbar.querySelector(".navbar-menu");
      if (menu) menu.remove();

      DOM.auth.container.style.display = "flex";
      DOM.settings.container.style.display = "none";
      DOM.deck.container.style.display = "none";
      DOM.flashcard.container.style.display = "none";
    }
  };

  // ===========================
  // Render Decks Function
  // ===========================

  const renderDecks = () => {
    const deckList = document.getElementById("deck-list");

    console.log("Rendering decks:", decks); // Debug log

    if (decks.length === 0) {
      deckList.innerHTML =
        "<p>No decks available. Create one to get started!</p>";
      return;
    }

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
            .map((deck) => {
              console.log(
                "Rendering deck:",
                deck.name,
                "Category:",
                deck.category
              );

              return `
                  <tr>
                    <td><a href="#" class="deck-link" data-deck="${deck.name}">${deck.name}</a></td>
                    <td>${deck.category}</td>
                    <td>${deck.cardCount} cards</td>
                    <td>${deck.totalPoints} points</td>
                    <td>
                      <button class="edit-btn" data-deck="${deck.name}">Edit</button>
                      <button class="delete-btn" data-deck="${deck.name}">Delete</button>
                    </td>
                  </tr>
                `;
            })
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
    DOM.deck.input.style.display = "flex";
    DOM.deck.nameInput.value = "";
  };

  const hideDeckInput = () => {
    DOM.deck.input.style.display = "none";
  };

  const saveDeck = () => {
    const deckName = DOM.deck.nameInput.value.trim();
    const categoryInput = document.getElementById("deck-category");
    const category = categoryInput ? categoryInput.value.trim() : "";

    console.log("Category input element:", categoryInput);
    console.log("Category value:", category);

    if (deckName && currentDeckFlashcards.length > 0 && category) {
      // Calculate total points
      const totalPoints = currentDeckFlashcards.reduce((sum, card) => {
        return sum + Number(card.points);
      }, 0);

      const newDeck = {
        name: deckName,
        category: category, // Using the category from input
        flashcards: currentDeckFlashcards,
        cardCount: currentDeckFlashcards.length,
        totalPoints: totalPoints,
      };

      console.log("New deck being saved:", newDeck); // Debug log

      decks.push(newDeck);
      saveDeckToLocalStorage();
      renderDecks();

      // Reset form
      DOM.deck.input.style.display = "none";
      DOM.deck.addButton.style.display = "block";
      DOM.deck.nameInput.value = "";
      categoryInput.value = "";
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

  DOM.deck.addButton.addEventListener("click", () => {
    DOM.deck.input.style.display = "block";
    DOM.deck.addButton.style.display = "none";
    currentDeckFlashcards = [];
    updateFlashcardList();
  });

  DOM.flashcard.addButton.addEventListener("click", () => {
    const question = DOM.flashcard.question.value.trim();
    const answer = DOM.flashcard.answer.value.trim();
    const points = Number(document.getElementById("flashcard-points").value);

    if (question && answer) {
      console.log("Adding flashcard with points:", points); // Debug log

      currentDeckFlashcards.push({
        question,
        answer,
        points,
      });

      console.log("Current flashcards:", currentDeckFlashcards); // Debug log

      updateFlashcardList();
      DOM.flashcard.question.value = "";
      DOM.flashcard.answer.value = "";
      document.getElementById("flashcard-points").value = "1";
    }
  });

  // Add the removeFlashcard function
  const removeFlashcard = (index) => {
    currentDeckFlashcards.splice(index, 1);
    updateFlashcardList();
  };

  // Update the updateFlashcardList function to use event listeners
  const updateFlashcardList = () => {
    DOM.flashcard.list.innerHTML = currentDeckFlashcards
      .map(
        (card, index) => `
      <li>
        <div class="flashcard-info">
          <strong>Q: ${card.question}</strong><br>
          A: ${card.answer}<br>
          Points: ${card.points}
        </div>
        <button class="remove-flashcard-btn" data-index="${index}">Remove</button>
      </li>
    `
      )
      .join("");

    // Add event listeners to remove buttons
    const removeButtons = DOM.flashcard.list.querySelectorAll(
      ".remove-flashcard-btn"
    );
    removeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = parseInt(button.getAttribute("data-index"));
        removeFlashcard(index);
      });
    });
  };

  function editFlashcard(index) {
    const card = currentDeckFlashcards[index];
    DOM.flashcard.question.value = card.question;
    DOM.flashcard.answer.value = card.answer;
    DOM.flashcard.addButton.textContent = "Update Flashcard";
    DOM.flashcard.addButton.onclick = () => {
      updateFlashcard(index);
    };
  }

  // function updateFlashcard(index) {
  //   const question = DOM.flashcard.question.value.trim();
  //   const answer = DOM.flashcard.answer.value.trim();
  //   if (question && answer) {
  //     currentDeckFlashcards[index] = { question, answer };
  //     DOM.flashcard.question.value = "";
  //     DOM.flashcard.answer.value = "";
  //     updateFlashcardList();
  //     DOM.flashcard.addButton.textContent = "Add Flashcard";
  //     DOM.flashcard.addButton.onclick = addFlashcard;
  //   }
  // }

  // function deleteFlashcard(index) {
  //   currentDeckFlashcards.splice(index, 1);
  //   updateFlashcardList();
  // }

  DOM.deck.saveButton.addEventListener("click", () => {
    const deckName = DOM.deck.nameInput.value.trim();
    const category = document.getElementById("deck-category").value.trim();

    if (deckName && currentDeckFlashcards.length > 0) {
      // Calculate total points
      const totalPoints = currentDeckFlashcards.reduce((sum, card) => {
        return sum + Number(card.points);
      }, 0);

      const existingDeckIndex = decks.findIndex((d) => d.name === deckName);
      const newDeck = {
        name: deckName,
        flashcards: currentDeckFlashcards,
        cardCount: currentDeckFlashcards.length,
        category: category || "Uncategorized", // Use user input or fallback if empty
        totalPoints: totalPoints,
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
      DOM.deck.input.style.display = "none";
      DOM.deck.addButton.style.display = "block";
      DOM.deck.nameInput.value = "";
      document.getElementById("deck-category").value = ""; // Clear category input
      currentDeckFlashcards = [];
      updateFlashcardList();

      // Reset the save button text if it was changed
      DOM.deck.saveButton.textContent = "Save Deck";
    } else {
      alert("Please enter a deck name and add at least one flashcard.");
    }
  });

  DOM.deck.cancelButton.addEventListener("click", () => {
    DOM.deck.input.style.display = "none";
    DOM.deck.addButton.style.display = "block";
    DOM.deck.nameInput.value = "";
    currentDeckFlashcards = [];
    updateFlashcardList();
  });

  function saveDeckToLocalStorage() {
    console.log("Saving to localStorage:", decks); // Debug log
    localStorage.setItem("decks", JSON.stringify(decks));
  }

  // ===========================
  // Open Flashcards Function
  // ===========================

  const openFlashcards = (deckName) => {
    // const decksContainer = document.getElementById("decks-container");
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
      DOM.deck.container.style.display = "block";
    };

    // Show first card
    showCurrentCard();

    DOM.deck.container.style.display = "none";
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

  // ===========================
  // Settings Event Listeners
  // ===========================
  const addSettingsEventListeners = () => {
    const settingsContainer = document.getElementById("settings-container");

    if (settingsContainer) {
      const goHomeLink = document.getElementById("go-home-link");
      if (goHomeLink) {
        goHomeLink.addEventListener("click", () => {
          console.log("Go Home clicked");
          settingsContainer.style.display = "none";
          if (DOM.deck.container) {
            DOM.deck.container.style.display = "block";
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
  DOM.auth.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const displayName = DOM.auth.displayNameInput.value;
    localStorage.setItem("user", JSON.stringify({ displayName }));
    checkAuth();
  });

  // ===========================
  // Theme Management
  // ===========================
  const initializeTheme = () => {
    const themeToggle = DOM.theme.toggle;
    if (!themeToggle) return;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme") || "light";

    // Set initial theme
    document.body.setAttribute("data-theme", savedTheme);
    themeToggle.checked = savedTheme === "dark";

    // Add event listener for theme toggle
    themeToggle.addEventListener("change", (e) => {
      const newTheme = e.target.checked ? "dark" : "light";
      document.body.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);

      // Update icons if they exist
      if (DOM.theme.sunIcon && DOM.theme.moonIcon) {
        DOM.theme.sunIcon.style.display =
          newTheme === "dark" ? "none" : "block";
        DOM.theme.moonIcon.style.display =
          newTheme === "dark" ? "block" : "none";
      }
    });
  };

  // ===========================
  // Confirm Modal Actions
  // ===========================
  const handleSignOut = () => {
    // Show modal and add blur effect
    DOM.modal.confirm.style.display = "flex";
    document.body.classList.add("blur");

    // Handle Yes button click
    DOM.modal.yesButton.addEventListener("click", () => {
      // Clear all data
      localStorage.clear();

      // Hide modal and remove blur
      DOM.modal.confirm.style.display = "none";
      document.body.classList.remove("blur");

      // Reset UI state
      DOM.auth.container.style.display = "flex";
      DOM.deck.container.style.display = "none";
      DOM.settings.container.style.display = "none";
      DOM.flashcard.container.style.display = "none";

      // Remove navbar menu
      const menu = DOM.navbar.querySelector(".navbar-menu");
      if (menu) menu.remove();

      // Reload decks
      loadDecksFromLocalStorage();
    });

    // Handle No button click
    DOM.modal.noButton.addEventListener("click", () => {
      // Just hide modal and remove blur
      DOM.modal.confirm.style.display = "none";
      document.body.classList.remove("blur");
    });

    // Handle Cancel button click
    DOM.modal.cancelButton.addEventListener("click", () => {
      // Just hide modal and remove blur
      DOM.modal.confirm.style.display = "none";
      document.body.classList.remove("blur");
    });
  };

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
    DOM.deck.nameInput.value = deck.name;
    document.getElementById("deck-category").value = deck.category; // Set the existing category

    DOM.deck.input.style.display = "block";
    DOM.deck.addButton.style.display = "none";
    updateFlashcardList();

    // Change the save button to update instead of create
    DOM.deck.saveButton.textContent = "Update Deck";
    const originalSaveFunction = DOM.deck.saveButton.onclick;

    DOM.deck.saveButton.onclick = () => {
      const newDeckName = DOM.deck.nameInput.value.trim();
      const newCategory =
        document.getElementById("deck-category").value.trim() || deck.category; // Use new category or keep existing

      if (newDeckName && currentDeckFlashcards.length > 0) {
        const deckIndex = decks.findIndex((d) => d.name === deckName);
        if (deckIndex !== -1) {
          // Calculate total points
          const totalPoints = currentDeckFlashcards.reduce(
            (sum, card) => sum + parseInt(card.points),
            0
          );

          decks[deckIndex] = {
            name: newDeckName,
            flashcards: currentDeckFlashcards,
            cardCount: currentDeckFlashcards.length,
            category: newCategory,
            totalPoints: totalPoints,
          };

          saveDeckToLocalStorage();
          renderDecks();
          DOM.deck.input.style.display = "none";
          DOM.deck.addButton.style.display = "block";
          DOM.deck.nameInput.value = "";
          document.getElementById("deck-category").value = "";
          currentDeckFlashcards = [];
          updateFlashcardList();

          // Reset the save button
          DOM.deck.saveButton.textContent = "Save Deck";
          DOM.deck.saveButton.onclick = originalSaveFunction;
        }
      }
    };
  }

  // Add this function to handle leaderboard updates
  const updateLeaderboard = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/scores");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const scores = await response.json();

      const leaderboardBody = document.getElementById("leaderboard-body");

      // Fade out existing scores
      leaderboardBody.style.opacity = "0";

      setTimeout(() => {
        leaderboardBody.innerHTML = "";

        scores.forEach((score, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.username}</td>
            <td>${score.score}</td>
            <td>${new Date(score.date).toLocaleDateString()}</td>
          `;

          // Add animation delay based on position
          row.style.animation = `fadeIn 0.5s ease-in-out ${
            index * 0.1
          }s forwards`;

          leaderboardBody.appendChild(row);
        });

        // Fade in new scores
        leaderboardBody.style.opacity = "1";
      }, 300);
    } catch (error) {
      console.error("Error fetching scores:", error);
    }
  };

  // Add this function to handle score submission
  const submitScore = async (score) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.displayName) {
        console.error("No user found");
        return;
      }

      const response = await fetch("http://localhost:3000/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user.displayName,
          score: score,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Score submitted successfully:", result);

      // Update the leaderboard after submitting a score
      updateLeaderboard();
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };

  // Call updateLeaderboard when the page loads
  updateLeaderboard();

  // Add this function to submit a new score
  const testButton = document.createElement("button");
  testButton.textContent = "Test Score Submission";
  testButton.onclick = () => submitScore(Math.floor(Math.random() * 100));
  document.body.appendChild(testButton);

  const startDeck = (deckName) => {
    const deck = decks.find((d) => d.name === deckName);
    if (!deck) return;

    // Set the current deck name
    currentDeck = deckName;

    // Show flashcard container
    DOM.flashcard.container.style.display = "block";

    // Initialize deck state and scores
    currentCardIndex = 0;
    currentScore = 0;
    totalPossibleScore = deck.flashcards.reduce(
      (total, card) => total + card.points,
      0
    );

    // Update score display
    document.getElementById("current-score").textContent = currentScore;
    document.getElementById("total-possible").textContent = totalPossibleScore;

    // Update question counter with actual card index
    document.getElementById("current-question").textContent = (
      currentCardIndex + 1
    ).toString();
    document.getElementById("total-questions").textContent =
      deck.flashcards.length;

    // Get DOM elements once
    const questionText = document.getElementById("question-text");
    const userAnswerInput = document.getElementById("user-answer");
    const feedbackMessage = document.getElementById("feedback-message");
    const submitButton = document.getElementById("submit-answer");

    // Set initial card content
    if (deck.flashcards && deck.flashcards.length > 0) {
      questionText.textContent = deck.flashcards[currentCardIndex].question;
    }

    // Reset input and feedback
    userAnswerInput.value = "";
    userAnswerInput.disabled = false;
    feedbackMessage.style.display = "none";
  };

  function checkAnswer() {
    const deck = decks.find((d) => d.name === currentDeck);
    if (!deck) return;

    const currentCard = deck.flashcards[currentCardIndex];
    const userAnswerInput = document.getElementById("user-answer");
    const feedbackMessage = document.getElementById("feedback-message");
    const questionText = document.getElementById("question-text");
    const submitButton = document.getElementById("submit-answer");
    const scoreDisplay = document.getElementById("current-score");

    // Debug log
    console.log("Checking answer for card:", currentCardIndex + 1);

    const userAnswer = userAnswerInput.value.trim().toLowerCase();
    const correctAnswer = currentCard.answer.toLowerCase();

    feedbackMessage.style.display = "block";

    if (userAnswer === correctAnswer) {
      currentScore += currentCard.points;
      scoreDisplay.textContent = currentScore;
      feedbackMessage.textContent = `Correct! +${currentCard.points} points`;
      feedbackMessage.className = "correct";
    } else {
      feedbackMessage.textContent = `Incorrect. The correct answer was: ${currentCard.answer}`;
      feedbackMessage.className = "incorrect";
    }

    questionText.textContent = currentCard.answer;
    isShowingQuestion = false;
    userAnswerInput.disabled = true;
    submitButton.disabled = true;

    // Update counter here as well
    document.getElementById("current-question").textContent = (
      currentCardIndex + 1
    ).toString();
  }

  // Update the endDeck function
  const endDeck = () => {
    const flashcardContainer = document.getElementById("flashcard-container");
    flashcardContainer.style.display = "none";
    flashcardContainer.classList.remove("active");

    // Rest of your existing endDeck code...
  };

  // Add this CSS animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // Add this event listener for the close button
  const closeFlashcardButton = document.getElementById("close-flashcard");
  if (closeFlashcardButton) {
    closeFlashcardButton.addEventListener("click", () => {
      const flashcardContainer = document.getElementById("flashcard-container");
      flashcardContainer.style.display = "none";

      // Reset any ongoing study session state if needed
      currentCardIndex = 0;
      currentScore = 0;

      // Make sure the decks and leaderboard are visible
      DOM.deck.container.style.display = "block";
      DOM.leaderboard.container.style.display = "block";
    });
  }

  // Add these event listeners and functions
  document
    .getElementById("submit-answer")
    .addEventListener("click", checkAnswer);
  const userAnswerInput = document.getElementById("user-answer");
  const feedbackMessage = document.getElementById("feedback-message");

  // Make sure the submit button is properly connected
  document
    .getElementById("submit-answer")
    .addEventListener("click", checkAnswer);

  // Update the next card function to reset the answer section
  document.getElementById("next-flashcard").addEventListener("click", nextCard);

  // Create a helper function for event listeners
  const addEventListeners = (elements, eventType, callback) => {
    if (Array.isArray(elements)) {
      elements.forEach((element) =>
        element.addEventListener(eventType, callback)
      );
    } else {
      elements.addEventListener(eventType, callback);
    }
  };

  const FlashcardManager = {
    add: (question, answer, points) => {
      if (!question || !answer) return;

      currentDeckFlashcards.push({ question, answer, points });
      updateFlashcardList();
      resetInputs();
    },

    remove: (index) => {
      currentDeckFlashcards.splice(index, 1);
      updateFlashcardList();
    },

    update: (index, question, answer, points) => {
      if (!question || !answer) return;

      currentDeckFlashcards[index] = { question, answer, points };
      updateFlashcardList();
      resetInputs();
    },
  };

  const Storage = {
    save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    get: (key) => JSON.parse(localStorage.getItem(key)),
    remove: (key) => localStorage.removeItem(key),
    clear: () => localStorage.clear(),
  };

  // Add this function to your app.js
  const initializeThemeToggle = () => {
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      // Check if element exists
      const currentTheme = localStorage.getItem("theme") || "light";
      themeToggle.checked = currentTheme === "dark";

      // Set initial theme
      document.body.setAttribute("data-theme", currentTheme);
    }
  };

  // Call this after DOM content is loaded
  document.addEventListener("DOMContentLoaded", () => {
    initializeThemeToggle();
    // ... rest of your initialization code
  });

  // Add this function to show the score summary
  function showScoreSummary() {
    const summaryModal = document.getElementById("score-summary-modal");
    const finalScore = document.getElementById("final-score");
    const finalPossible = document.getElementById("final-possible");
    const finalPercentage = document.getElementById("final-percentage");
    const performanceMessage = document.getElementById("performance-message");

    // Calculate percentage
    const percentage = (currentScore / totalPossibleScore) * 100;

    // Update summary elements
    finalScore.textContent = currentScore;
    finalPossible.textContent = totalPossibleScore;
    finalPercentage.textContent = `${percentage.toFixed(1)}%`;

    // Set performance message based on percentage
    if (percentage === 100) {
      performanceMessage.textContent = "Perfect Score! Outstanding!";
    } else if (percentage >= 80) {
      performanceMessage.textContent = "Great job! Keep it up!";
    } else if (percentage >= 60) {
      performanceMessage.textContent = "Good work! Room for improvement.";
    } else {
      performanceMessage.textContent = "Keep practicing, you'll get better!";
    }

    // Show the modal
    summaryModal.style.display = "flex";
  }

  // Update your close button event listener
  document.getElementById("close-flashcard").addEventListener("click", () => {
    showScoreSummary();
  });

  // Add event listener for the continue button
  document.getElementById("close-summary").addEventListener("click", () => {
    document.getElementById("score-summary-modal").style.display = "none";
    document.getElementById("flashcard-container").style.display = "none";
    document.getElementById("decks-container").style.display = "block";

    // Reset scores
    currentScore = 0;
    totalPossibleScore = 0;
  });

  function nextCard() {
    const deck = decks.find((d) => d.name === currentDeck);
    if (!deck) return;

    // Increment card index
    currentCardIndex++;

    console.log(
      "Moving to card:",
      currentCardIndex + 1,
      "of",
      deck.flashcards.length
    );

    // Check if we're at the last card
    if (currentCardIndex >= deck.flashcards.length - 1) {
      const nextButton = document.getElementById("next-flashcard");

      // Add fade out effect
      nextButton.style.opacity = "0";
      nextButton.style.transform = "scale(0.9)";
      nextButton.style.transition = "all 0.3s ease";

      // Change button after fade out
      setTimeout(() => {
        nextButton.textContent = "Submit Score";
        nextButton.className = "submit-score-btn";

        // Fade back in
        nextButton.style.opacity = "1";
        nextButton.style.transform = "scale(1)";

        // Remove the nextCard event listener and add the submit score listener
        nextButton.removeEventListener("click", nextCard);
        nextButton.addEventListener("click", () => {
          showScoreSummary();

          // Reset button with animation
          nextButton.style.opacity = "0";
          setTimeout(() => {
            nextButton.textContent = "Next";
            nextButton.className = "";
            nextButton.style.opacity = "1";
            nextButton.addEventListener("click", nextCard);
          }, 300);
        });
      }, 300);
    }

    // Rest of your existing nextCard code...
  }

  // Add this to your initialization calls at the bottom
  initializeTheme();
});
