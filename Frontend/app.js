document.addEventListener("DOMContentLoaded", () => {
  // ===========================
  // DOM Elements Selection
  // ===========================
  const navbar = document.getElementById("navbar");
  const authContainer = document.getElementById("auth-container");
  const settingsContainer = document.getElementById("settings-container");
  const decksContainer = document.getElementById("decks-container");
  const leaderboardContainer = document.getElementById("leaderboard-container");
  const flashcardContainer = document.getElementById("flashcard-container");
  const authForm = document.getElementById("auth-form");
  const displayNameInput = document.getElementById("display-name");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const deckInput = document.getElementById("deck-input");
  const newDeckNameInput = document.getElementById("new-deck-name");
  const flashcardQuestion = document.getElementById("flashcard-question");
  const flashcardAnswer = document.getElementById("flashcard-answer");
  const addFlashcardButton = document.getElementById("add-flashcard-button");
  const flashcardList = document.getElementById("flashcard-list");
  const addDeckButton = document.getElementById("add-deck-button");
  const saveDeckButton = document.getElementById("save-deck-button");
  const cancelDeckButton = document.getElementById("cancel-deck-button");
  const confirmModal = document.getElementById("confirm-modal");

  // ===========================
  // Authentication Check
  // ===========================

  const checkAuth = () => {
    console.log("Checking authentication...");
    const user = JSON.parse(localStorage.getItem("user"));
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

  const loadDecksFromLocalStorage = () => {
    const savedDecks = localStorage.getItem("decks");
    if (savedDecks) {
      decks = JSON.parse(savedDecks);
      console.log("Loaded decks:", decks); // Debug log
    } else {
      decks = [];
    }
  };

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
    deckInput.style.display = "flex";
    newDeckNameInput.value = "";
  };

  const hideDeckInput = () => {
    deckInput.style.display = "none";
  };

  const saveDeck = () => {
    const deckName = newDeckNameInput.value.trim();
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
      deckInput.style.display = "none";
      addDeckButton.style.display = "block";
      newDeckNameInput.value = "";
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

  addDeckButton.addEventListener("click", () => {
    deckInput.style.display = "block";
    addDeckButton.style.display = "none";
    currentDeckFlashcards = [];
    updateFlashcardList();
  });

  addFlashcardButton.addEventListener("click", () => {
    const question = flashcardQuestion.value.trim();
    const answer = flashcardAnswer.value.trim();
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
      flashcardQuestion.value = "";
      flashcardAnswer.value = "";
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
    flashcardList.innerHTML = currentDeckFlashcards
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
    const removeButtons = flashcardList.querySelectorAll(
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
    flashcardQuestion.value = card.question;
    flashcardAnswer.value = card.answer;
    addFlashcardButton.textContent = "Update Flashcard";
    addFlashcardButton.onclick = () => {
      updateFlashcard(index);
    };
  }

  // function updateFlashcard(index) {
  //   const question = flashcardQuestion.value.trim();
  //   const answer = flashcardAnswer.value.trim();
  //   if (question && answer) {
  //     currentDeckFlashcards[index] = { question, answer };
  //     flashcardQuestion.value = "";
  //     flashcardAnswer.value = "";
  //     updateFlashcardList();
  //     addFlashcardButton.textContent = "Add Flashcard";
  //     addFlashcardButton.onclick = addFlashcard;
  //   }
  // }

  // function deleteFlashcard(index) {
  //   currentDeckFlashcards.splice(index, 1);
  //   updateFlashcardList();
  // }

  saveDeckButton.addEventListener("click", () => {
    const deckName = newDeckNameInput.value.trim();
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
      deckInput.style.display = "none";
      addDeckButton.style.display = "block";
      newDeckNameInput.value = "";
      document.getElementById("deck-category").value = ""; // Clear category input
      currentDeckFlashcards = [];
      updateFlashcardList();

      // Reset the save button text if it was changed
      saveDeckButton.textContent = "Save Deck";
    } else {
      alert("Please enter a deck name and add at least one flashcard.");
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
    document.getElementById("deck-category").value = deck.category; // Set the existing category

    deckInput.style.display = "block";
    addDeckButton.style.display = "none";
    updateFlashcardList();

    // Change the save button to update instead of create
    saveDeckButton.textContent = "Update Deck";
    const originalSaveFunction = saveDeckButton.onclick;

    saveDeckButton.onclick = () => {
      const newDeckName = newDeckNameInput.value.trim();
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
          deckInput.style.display = "none";
          addDeckButton.style.display = "block";
          newDeckNameInput.value = "";
          document.getElementById("deck-category").value = "";
          currentDeckFlashcards = [];
          updateFlashcardList();

          // Reset the save button
          saveDeckButton.textContent = "Save Deck";
          saveDeckButton.onclick = originalSaveFunction;
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
    const flashcardContainer = document.getElementById("flashcard-container");
    flashcardContainer.style.display = "block";

    // Initialize deck state
    currentCardIndex = 0;
    currentScore = 0;

    // Get the question text element
    const questionText = document.getElementById("question-text");

    // Set initial card content
    if (deck.flashcards && deck.flashcards.length > 0) {
      questionText.textContent = deck.flashcards[currentCardIndex].question;
      console.log(
        "Setting question:",
        deck.flashcards[currentCardIndex].question
      ); // Debug log
    } else {
      questionText.textContent = "No flashcards in this deck";
    }

    // Reset answer section
    const userAnswerInput = document.getElementById("user-answer");
    const feedbackMessage = document.getElementById("feedback-message");
    if (userAnswerInput) userAnswerInput.value = "";
    if (feedbackMessage) feedbackMessage.style.display = "none";

    // Make sure the decks and leaderboard remain visible
    decksContainer.style.display = "block";
    leaderboardContainer.style.display = "block";

    // Add flip functionality
    document.getElementById("flip-flashcard").addEventListener("click", () => {
      const deck = decks.find((d) => d.name === currentDeck);
      if (!deck) return;

      const questionText = document.getElementById("question-text");
      const currentCard = deck.flashcards[currentCardIndex];

      if (isShowingQuestion) {
        questionText.textContent = currentCard.answer;
      } else {
        questionText.textContent = currentCard.question;
      }
      isShowingQuestion = !isShowingQuestion;
    });

    // Add next card functionality
    document.getElementById("next-flashcard").addEventListener("click", () => {
      const deck = decks.find((d) => d.name === currentDeck);
      if (!deck) return;

      currentCardIndex = (currentCardIndex + 1) % deck.flashcards.length;
      const questionText = document.getElementById("question-text");
      questionText.textContent = deck.flashcards[currentCardIndex].question;
      isShowingQuestion = true;
    });
  };

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
      decksContainer.style.display = "block";
      leaderboardContainer.style.display = "block";
    });
  }

  // Add these event listeners and functions
  document
    .getElementById("submit-answer")
    .addEventListener("click", checkAnswer);
  const userAnswerInput = document.getElementById("user-answer");
  const feedbackMessage = document.getElementById("feedback-message");

  function checkAnswer() {
    const deck = decks.find((d) => d.name === currentDeck);
    if (!deck) return;

    const currentCard = deck.flashcards[currentCardIndex];
    const userAnswer = userAnswerInput.value.trim().toLowerCase();
    const correctAnswer = currentCard.answer.toLowerCase();

    feedbackMessage.style.display = "block";

    if (userAnswer === correctAnswer) {
      // Correct answer
      feedbackMessage.textContent = `Correct answer! +${
        currentCard.points || 1
      } points`;
      feedbackMessage.className = "correct";
      currentScore += currentCard.points || 1;
    } else {
      // Incorrect answer
      feedbackMessage.textContent = "Incorrect answer";
      feedbackMessage.className = "incorrect";
    }

    // Show the correct answer
    setTimeout(() => {
      const questionText = document.getElementById("question-text");
      questionText.textContent = currentCard.answer;
      isShowingQuestion = false;
    }, 1000);

    // Clear the input field
    userAnswerInput.value = "";
  }

  // Update the next card function to reset the answer section
  document.getElementById("next-flashcard").addEventListener("click", () => {
    const deck = decks.find((d) => d.name === currentDeck);
    if (!deck) return;

    currentCardIndex = (currentCardIndex + 1) % deck.flashcards.length;
    const questionText = document.getElementById("question-text");
    questionText.textContent = deck.flashcards[currentCardIndex].question;
    isShowingQuestion = true;

    // Reset answer section
    userAnswerInput.value = "";
    feedbackMessage.style.display = "none";
  });
});
