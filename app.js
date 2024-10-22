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

  const checkAuth = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
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

  const addNavbarEventListeners = () => {
    const menu = navbar.querySelector(".navbar-menu");
    if (menu) {
      menu.addEventListener("click", (e) => {
        if (e.target.id === "sign-out-link") {
          localStorage.removeItem("user");
          checkAuth();
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
          // TODO: EDIT DECK FUNCTIONALITY
          console.log("Edit decks clicked");
        });
      }

      const resetDecksBtn = document.getElementById("reset-decks");
      if (resetDecksBtn) {
        resetDecksBtn.addEventListener("click", () => {
          // TODO: RESET DECK FUNCTIONALITY
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

  // Set initial theme
  const savedTheme = localStorage.getItem("theme") || "light";
  themeToggle.checked = savedTheme === "dark";
  updateTheme(savedTheme === "dark");

  // Theme toggle click handler
  themeIcon.addEventListener("click", () => {
    themeToggle.checked = !themeToggle.checked;
    const isDark = themeToggle.checked;
    updateTheme(isDark);
  });

  // Theme toggle change handler
  themeToggle.addEventListener("change", (e) => {
    updateTheme(e.target.checked);
  });

  checkAuth();
});
