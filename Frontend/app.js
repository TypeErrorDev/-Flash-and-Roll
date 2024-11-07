document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------------
  // Initialization and Variables
  // -----------------------------------
  let currentScore = 0;
  let totalPossibleScore = 0;
  let currentCardIndex = 0;
  let currentDeck = "";
  let isShowingQuestion = true;

  let currentUser = null;

  // First, define the DEFAULT_DECK constant
  const DEFAULT_DECK = {
    name: "JavaScript Info",
    category: "JavaScript",
    flashcards: [
      {
        question: "What is the difference between let and var?",
        answer: "block scope vs function scope",
        points: 1,
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
    totalPoints: 100,
  };

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

  // -----------------------------------
  // Load Decks from Local Storage
  // -----------------------------------
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

      decks = [DEFAULT_DECK];

      localStorage.setItem("decks", JSON.stringify(decks));
      console.log("Created default deck:", decks);
    }
  };

  let decks = [];

  // ===========================
  // Authentication Check
  // ===========================

  const fetchUserDecks = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}/decks`
      );
      if (!response.ok) throw new Error("Failed to fetch decks");
      const decks = await response.json();
      renderDecks(decks);
    } catch (error) {
      console.error("Error fetching decks:", error);
    }
  };

  const checkAuth = () => {
    console.log("Checking authentication...");
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    }

    if (currentUser && currentUser.id) {
      console.log("User authenticated:", currentUser.displayName);
      document.getElementById("user-name").textContent =
        currentUser.displayName;

      DOM.deck.container.style.display = "block";
      DOM.leaderboard.container.style.display = "block";
      DOM.auth.container.style.display = "none"; // Hide auth container

      const menu = document.createElement("ul");
      menu.className = "navbar-menu";
      menu.innerHTML = `
            <li id="settings-link">Settings</li>
            <li id="sign-out-link">Sign Out</li>
        `;
      const existingMenu = DOM.navbar.querySelector(".navbar-menu");
      if (existingMenu) existingMenu.remove();

      DOM.navbar.appendChild(menu);
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

      DOM.flashcard.container.style.display = "none";
    } else {
      console.log("No user authenticated");
      const menu = DOM.navbar.querySelector(".navbar-menu");
      if (menu) menu.remove();

      DOM.auth.container.style.display = "flex";
      DOM.settings.container.style.display = "none";
      DOM.deck.container.style.display = "none";
      DOM.flashcard.container.style.display = "none";
      DOM.leaderboard.container.style.display = "none";
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
                deck.category,
                "Card Count:",
                deck.cardCount,
                "Total Points:",
                deck.totalPoints
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

    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || !user.id) {
      alert("User not authenticated");
      return;
    }

    if (deckName && currentDeckFlashcards.length > 0 && category) {
      const newDeck = {
        userId: user.id,
        name: deckName,
        category: category,
        flashcards: currentDeckFlashcards,
      };

      console.log("New deck being saved:", newDeck);

      fetch("http://localhost:3000/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDeck),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Deck saved:", data);
          fetchUserDecks(user.id); // Refresh the deck list from the database
        })
        .catch((error) => console.error("Error saving deck:", error));
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
        category: category || "Uncategorized",
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
      document.getElementById("deck-category").value = "";
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
  }

  // ===========================
  // Open Flashcards Function
  // ===========================

  const openFlashcards = (deckName) => {
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
    const username = DOM.auth.displayNameInput.value.trim();
    const displayName = username;
    loginUser(username, displayName);
  });

  // ===========================
  // Theme Management
  // ===========================
  const ThemeManager = {
    init() {
      const savedTheme = localStorage.getItem("theme") || "light";
      this.setTheme(savedTheme);

      // Add click handler for theme icon
      DOM.theme.icon.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        this.setTheme(newTheme);
      });
    },

    setTheme(theme) {
      document.body.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);

      // Update icons
      if (DOM.theme.sunIcon && DOM.theme.moonIcon) {
        if (theme === "dark") {
          DOM.theme.sunIcon.style.display = "none";
          DOM.theme.moonIcon.style.display = "block";
        } else {
          DOM.theme.sunIcon.style.display = "block";
          DOM.theme.moonIcon.style.display = "none";
        }
      }
    },
  };

  // Initialize theme
  ThemeManager.init();

  // ===========================
  // Confirm Modal Actions
  // ===========================
  const handleSignOut = () => {
    DOM.modal.confirm.style.display = "flex";
    document.body.classList.add("blur");

    const signOut = () => {
      DOM.modal.confirm.style.display = "none";
      document.body.classList.remove("blur");
      DOM.auth.container.style.display = "flex";
      DOM.deck.container.style.display = "none";
      DOM.settings.container.style.display = "none";
      DOM.flashcard.container.style.display = "none";
      DOM.leaderboard.container.style.display = "none";
      const menu = DOM.navbar.querySelector(".navbar-menu");
      if (menu) menu.remove();
      loadDecksFromLocalStorage();
    };

    DOM.modal.yesButton.addEventListener("click", () => {
      localStorage.clear(); // Clear local storage only on "Yes"
      signOut();
    });

    DOM.modal.noButton.addEventListener("click", () => {
      signOut(); // Sign out without clearing local storage
    });

    DOM.modal.cancelButton.addEventListener("click", () => {
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

  addSettingsEventListeners();

  function editDeck(deckName) {
    const deck = decks.find((d) => d.name === deckName);
    if (!deck) return;

    currentDeckFlashcards = [...deck.flashcards];
    DOM.deck.nameInput.value = deck.name;
    document.getElementById("deck-category").value = deck.category;

    DOM.deck.input.style.display = "block";
    DOM.deck.addButton.style.display = "none";
    updateFlashcardList();

    // Change the save button to update instead of create
    DOM.deck.saveButton.textContent = "Update Deck";
    const originalSaveFunction = DOM.deck.saveButton.onclick;

    DOM.deck.saveButton.onclick = () => {
      const newDeckName = DOM.deck.nameInput.value.trim();
      const newCategory =
        document.getElementById("deck-category").value.trim() || deck.category;

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

      const filteredScores = scores.filter((score) => score.score >= 50);

      const leaderboardBody = document.getElementById("leaderboard-body");

      // Fade out existing scores
      leaderboardBody.style.opacity = "0";

      setTimeout(() => {
        leaderboardBody.innerHTML = "";

        filteredScores.forEach((score, index) => {
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
      const user = JSON.parse(localStorage.getItem("currentUser"));
      console.log("Retrieved user from local storage:", user); // Debug log
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

  updateLeaderboard();

  // Add this function to submit a new score
  const testButton = document.createElement("button");
  testButton.textContent = "Test Score Submission";
  testButton.onclick = () => submitScore(Math.floor(Math.random() * 100));
  document.body.appendChild(testButton);

  const startDeck = (deckName) => {
    const deck = decks.find((d) => d.name === deckName);
    if (!deck) return;

    currentDeck = deckName;

    DOM.flashcard.container.style.display = "block";

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
      const currentTheme = localStorage.getItem("theme") || "light";
      themeToggle.checked = currentTheme === "dark";

      document.body.setAttribute("data-theme", currentTheme);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    initializeThemeToggle();
  });

  function showScoreSummary() {
    const deck = decks.find((d) => d.name === currentDeck);
    if (!deck) return;

    const scoreSummaryModal = document.getElementById("score-summary-modal");
    if (!scoreSummaryModal) {
      console.error("Score summary modal not found");
      return;
    }

    const totalFlashcards = deck.flashcards.length;
    const correctPercentage = (
      (currentScore / totalPossibleScore) *
      100
    ).toFixed(2);

    const finalScoreElement = document.getElementById("final-score");
    const finalPossibleElement = document.getElementById("final-possible");
    const finalPercentageElement = document.getElementById("final-percentage");

    if (
      !finalScoreElement ||
      !finalPossibleElement ||
      !finalPercentageElement
    ) {
      console.error("Score summary elements not found");
      return;
    }
    finalScoreElement.textContent = currentScore;
    finalPossibleElement.textContent = totalPossibleScore;
    finalPercentageElement.textContent = `${correctPercentage}%`;

    scoreSummaryModal.style.display = "block";
  }
  document.getElementById("close-flashcard").addEventListener("click", () => {
    showScoreSummary();
  });
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
    if (currentCardIndex >= deck.flashcards.length) {
      showScoreSummary();
      return;
    }

    // Update the counter
    const questionCounter = document.getElementById("current-question");
    questionCounter.textContent = (currentCardIndex + 1).toString();

    // Reset card state
    const questionText = document.getElementById("question-text");
    const userAnswerInput = document.getElementById("user-answer");
    const feedbackMessage = document.getElementById("feedback-message");
    const submitButton = document.getElementById("submit-answer");

    // Ensure currentCardIndex is within bounds
    if (currentCardIndex < deck.flashcards.length) {
      questionText.textContent = deck.flashcards[currentCardIndex].question;
    } else {
      console.error("Current card index is out of bounds");
      return;
    }

    userAnswerInput.value = "";
    userAnswerInput.disabled = false;
    feedbackMessage.style.display = "none";
    submitButton.disabled = false;
    isShowingQuestion = true;
  }

  const loginUser = async (username, displayName) => {
    try {
      console.log("Checking if user exists:", username);
      const checkResponse = await fetch(
        `http://localhost:3000/api/users/${username}`
      );

      if (checkResponse.ok) {
        const userData = await checkResponse.json();
        console.log("User exists, logging in:", userData);
        currentUser = userData;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        fetchUserDecks(userData.id);
        checkAuth();
      } else if (checkResponse.status === 404) {
        console.log("User not found, creating new user:", username);
        const createResponse = await fetch("http://localhost:3000/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, displayName }),
        });

        if (!createResponse.ok) throw new Error("Failed to create user");
        const newUserData = await createResponse.json();
        console.log("New user created:", newUserData);
        currentUser = newUserData;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        fetchUserDecks(newUserData.id);
        checkAuth();
      } else {
        throw new Error("Unexpected error occurred");
      }
    } catch (error) {
      console.error("Error logging in or creating user:", error);
    }
  };
  DOM.auth.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = DOM.auth.displayNameInput.value.trim();
    const displayName = username;
    loginUser(username, displayName);
  });
});
