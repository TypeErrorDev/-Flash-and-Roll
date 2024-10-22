document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const authContainer = document.getElementById("auth-container");
  const settingsContainer = document.getElementById("settings-container");
  const authForm = document.getElementById("auth-form");
  const displayNameInput = document.getElementById("display-name");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");
  const confirmModal = document.getElementById("confirm-modal");
  const confirmMessage = document.getElementById("confirm-message");

  const checkAuth = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      // Update the modal with the user's display name
      document.getElementById("user-name").textContent = user.displayName;

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
      addNavbarEventListeners();
      addSettingsEventListeners();
    } else {
      const menu = navbar.querySelector(".navbar-menu");
      if (menu) menu.remove();

      authContainer.style.display = "flex";
      settingsContainer.style.display = "none";
    }
  };

  const showConfirmMessage = (displayName) => {
    confirmMessage.textContent = `Want to clear all data for ${displayName}?`;
  };

  const addNavbarEventListeners = () => {
    const menu = navbar.querySelector(".navbar-menu");
    if (menu) {
      menu.addEventListener("click", (e) => {
        if (e.target.id === "sign-out-link") {
          confirmModal.style.display = "flex"; // Show the confirmation modal
        } else if (e.target.id === "settings-link") {
          settingsContainer.style.display = "block";
        }
      });
    }
  };

  const addSettingsEventListeners = () => {
    if (settingsContainer) {
      const goHomeLink = document.getElementById("go-home-link");
      if (goHomeLink) {
        goHomeLink.addEventListener("click", () => {
          settingsContainer.style.display = "none";
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
          console.log("Reset decks clicked");
        });
      }
    }
  };

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const displayName = displayNameInput.value;
    localStorage.setItem("user", JSON.stringify({ displayName }));
    checkAuth();
  });

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

  // Confirm modal actions
  document.getElementById("confirm-yes").addEventListener("click", () => {
    localStorage.clear();
    confirmModal.style.display = "none";
    alert("Local storage cleared. You have been signed out.");
    checkAuth();
  });

  document.getElementById("confirm-no").addEventListener("click", () => {
    confirmModal.style.display = "none";
    alert("You have been signed out. Your data remains.");
    localStorage.removeItem("user");
    checkAuth();
  });

  // Add functionality for the Cancel button
  document.getElementById("confirm-cancel").addEventListener("click", () => {
    confirmModal.style.display = "none"; // Close the modal
  });

  checkAuth();
});
