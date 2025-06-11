// Biome → background URLs
const biomeImages = {
  coast:   "images/placeholder_coast.jpg",
  forest:  "images/placeholder_forest.jpg",
  mountains:"images/placeholder_mountains.jpg",
  plains:  "images/placeholder_plains.jpg",
  swamp:   "images/placeholder_swamp.jpg",
  tundra:  "images/placeholder_tundra.jpg"
};

// Update background & mode
function updateBackground() {
  const biome = document.getElementById("biomeSelect").value;
  const mode  = document.getElementById("uiModeSelect").value;

  document.body.style.backgroundImage = `url('${biomeImages[biome] || ""}')`;
  document.body.classList.remove("light", "mid", "dark");
  document.body.classList.add(mode);          // adds 'light', 'mid', or 'dark'
}

// Tab navigation
function navigateTo(section) {
  const main = document.getElementById("mainContent");
  const pages = {
    camp:       `<h2>Welcome to ClanLife</h2><p>Create an account or log in…</p><button id="loginBtn">Log In</button><button id="signupBtn">Sign Up</button>`,
    explore:    `<h2>Explore</h2><p>Search the territory…</p>`,
    inventory:  `<h2>Inventory</h2><p>View your items…</p>`,
    crossroads: `<h2>Crossroads</h2><p>Meet neighboring clans…</p>`
  };
  main.innerHTML = pages[section] || "<h2>Coming soon…</h2>";
  // Re-attach auth buttons each time Camp page is rendered
  if (section === "camp") attachAuthHandlers();
}

// ---- Firebase Auth ----
const firebaseConfig = {
  apiKey:            "AIzaSyCYMR8LL_cfHNswh7nU8l4gwxWxKmiJOjc",
  authDomain:        "clanlife-project.firebaseapp.com",
  projectId:         "clanlife-project",
  storageBucket:     "clanlife-project.appspot.com",
  messagingSenderId: "553812082452",
  appId:             "1:553812082452:web:0bb5f381c2d7b113d48c01",
  measurementId:     "G-4PPGL63VKN"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function showLoginForm() {
  const email = prompt("Email:");
  const pass  = prompt("Password:");
  if (email && pass)
    auth.signInWithEmailAndPassword(email, pass)
        .then(() => alert("Logged in!"))
        .catch(e => alert(e.message));
}

function showSignupForm() {
  const email = prompt("Email:");
  const pass  = prompt("Password (6+ chars):");
  if (email && pass)
    auth.createUserWithEmailAndPassword(email, pass)
        .then(() => alert("Account created!"))
        .catch(e => alert(e.message));
}

// Attach handlers (called on load & whenever Camp is re-rendered)
function attachAuthHandlers() {
  document.getElementById("loginBtn")?.addEventListener("click", showLoginForm);
  document.getElementById("signupBtn")?.addEventListener("click", showSignupForm);
}

// Initial setup
window.addEventListener("DOMContentLoaded", () => {
  updateBackground();
  attachAuthHandlers();
});
