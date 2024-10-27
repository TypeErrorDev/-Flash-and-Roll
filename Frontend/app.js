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
  const checkAuth = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const decksContainer = document.getElementById("decks-container");
    const flashcardContainer = document.getElementById("flashcard-container");

    if (user) {
      document.getElementById("user-name").textContent = user.displayName;

      if (!localStorage.getItem("decks")) {
        const defaultDeck = {
          name: "Tutorial Deck",
          cardCount: 5,
          category: "General",
        };
        localStorage.setItem("decks", JSON.stringify([defaultDeck]));
      }

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
          decksContainer.style.display = "none";
        }
      });

      decksContainer.style.display = "block";
      flashcardContainer.style.display = "none";
    } else {
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
    decks = JSON.parse(localStorage.getItem("decks")) || [];
  }

  function renderDecks() {
    const decksContainer = document.getElementById("deck-list");
    decksContainer.innerHTML = "";

    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
          <tr>
            <th>Deck Name</th>
            <th>Card Count</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${decks
            .map(
              (deck) => `
            <tr>
              <td class="deck-link" data-deck="${deck.name}">${deck.name}</td>
              <td>${deck.cardCount}</td>
              <td>${deck.category || "General"}</td>
              <td>
                <button class="edit-deck" data-deck="${deck.name}">Edit</button>
                <button class="delete-deck" data-deck="${
                  deck.name
                }">Delete</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      `;

    decksContainer.appendChild(table);

    // Add event listeners for deck links
    document.querySelectorAll(".deck-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        const deckName = e.target.dataset.deck;
        openFlashcards(deckName);
      });
    });

    // Add event listeners for delete buttons
    document.querySelectorAll(".delete-deck").forEach((button) => {
      button.addEventListener("click", (e) => {
        const deckName = e.target.dataset.deck;
        deleteDeck(deckName);
      });
    });

    // Add event listeners for edit buttons
    document.querySelectorAll(".edit-deck").forEach((button) => {
      button.addEventListener("click", (e) => {
        const deckName = e.target.dataset.deck;
        editDeck(deckName);
      });
    });
  }

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
    if (deckName && currentDeckFlashcards.length > 0) {
      const existingDeckIndex = decks.findIndex((d) => d.name === deckName);
      const newDeck = {
        name: deckName,
        flashcards: currentDeckFlashcards,
        cardCount: currentDeckFlashcards.length,
        category: "General", // You can add a category input if needed
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
      newDeckNameInput.value = "";
      currentDeckFlashcards = [];
      updateFlashcardList();
    }
  };

  const deleteDeck = (deckName) => {
    decks = decks.filter((deck) => deck.name !== deckName);
    saveDeckToLocalStorage();
    renderDecks();
  };

  let currentDeckFlashcards = [];

  addDeckButton.addEventListener("click", () => {
    deckInput.style.display = "block";
    currentDeckFlashcards = [];
    updateFlashcardList();
  });

  addFlashcardButton.addEventListener("click", () => {
    const question = flashcardQuestion.value.trim();
    const answer = flashcardAnswer.value.trim();
    if (question && answer) {
      currentDeckFlashcards.push({ question, answer });
      flashcardQuestion.value = "";
      flashcardAnswer.value = "";
      updateFlashcardList();
    }
  });

  function updateFlashcardList() {
    flashcardList.innerHTML = "";
    currentDeckFlashcards.forEach((card, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${index + 1}. ${card.question}</span>
        <button class="edit-flashcard" data-index="${index}">Edit</button>
        <button class="delete-flashcard" data-index="${index}">Delete</button>
      `;
      flashcardList.appendChild(li);
    });

    // Add event listeners for edit and delete flashcard buttons
    document.querySelectorAll(".edit-flashcard").forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        editFlashcard(index);
      });
    });

    document.querySelectorAll(".delete-flashcard").forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        deleteFlashcard(index);
      });
    });
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
      const newDeck = {
        name: deckName,
        flashcards: currentDeckFlashcards,
        cardCount: currentDeckFlashcards.length,
        category: "General", // You can add a category input if needed
      };
      decks.push(newDeck);
      saveDeckToLocalStorage();
      renderDecks();
      deckInput.style.display = "none";
      newDeckNameInput.value = "";
      currentDeckFlashcards = [];
      updateFlashcardList();
    }
  });

  cancelDeckButton.addEventListener("click", () => {
    deckInput.style.display = "none";
    newDeckNameInput.value = "";
    currentDeckFlashcards = [];
    updateFlashcardList();
  });

  function saveDeckToLocalStorage() {
    localStorage.setItem("decks", JSON.stringify(decks));
  }

  // ===========================
  // Open Flashcards Function
  // ===========================

  // TODO: I need to remove this and utilize the database to update the flashcard container
  const openFlashcards = (deckName) => {
    const decksContainer = document.getElementById("decks-container");
    const flashcardContainer = document.getElementById("flashcard-container");

    decksContainer.style.display = "none";
    flashcardContainer.style.display = "block";

    const questionText = document.getElementById("question-text");
    questionText.textContent = "What is the capital of France?";

    document.getElementById("close-flashcard").onclick = () => {
      flashcardContainer.style.display = "none";
      decksContainer.style.display = "block";
    };

    document.getElementById("skip-flashcard").onclick = () => {
      questionText.textContent = "Next question goes here.";
    };

    document.getElementById("flip-flashcard").onclick = () => {
      questionText.textContent = "The answer is Paris.";
    };

    // Add event listener for the new Next button
    document.getElementById("next-flashcard").onclick = () => {
      questionText.textContent = "Next question goes here.";
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
    if (settingsContainer) {
      const goHomeLink = document.getElementById("go-home-link");
      if (goHomeLink) {
        goHomeLink.addEventListener("click", () => {
          settingsContainer.style.display = "none";
          decksContainer.style.display = "block";
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
    localStorage.clear();
    confirmModal.style.display = "none";
    alert("Local storage cleared. You have been signed out.");
    const flashcardContainer = document.getElementById("flashcard-container");
    flashcardContainer.style.display = "none";
    checkAuth();
  });

  document.getElementById("confirm-no").addEventListener("click", () => {
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
});

function editDeck(deckName) {
  const deck = decks.find((d) => d.name === deckName);
  if (!deck) return;

  currentDeckFlashcards = [...deck.flashcards];
  newDeckNameInput.value = deck.name;
  deckInput.style.display = "block";
  updateFlashcardList();

  // Change the save button to update instead of create
  saveDeckButton.textContent = "Update Deck";
  saveDeckButton.onclick = () => updateDeck(deckName);
}

function updateDeck(oldDeckName) {
  const newDeckName = newDeckNameInput.value.trim();
  if (newDeckName && currentDeckFlashcards.length > 0) {
    const deckIndex = decks.findIndex((d) => d.name === oldDeckName);
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
      newDeckNameInput.value = "";
      currentDeckFlashcards = [];
      updateFlashcardList();

      // Reset the save button
      saveDeckButton.textContent = "Save Deck";
      saveDeckButton.onclick = saveDeck;
    }
  }
}
