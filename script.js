// Map of biome to image URLs
const biomeImages = {
  coast:
    "https://raw.githubusercontent.com/dawn475/project/23025b1beead3bd9b8f2b308b207020dc4ace85c/placeholder_coast.jpg",
  forest:
    "https://raw.githubusercontent.com/dawn475/project/23025b1beead3bd9b8f2b308b207020dc4ace85c/placeholder_forest.jpg",
  mountains:
    "https://raw.githubusercontent.com/dawn475/project/23025b1beead3bd9b8f2b308b207020dc4ace85c/placeholder_mountains.jpg",
  plains:
    "https://raw.githubusercontent.com/dawn475/project/23025b1beead3bd9b8f2b308b207020dc4ace85c/placeholder_plains.jpg",
  swamp:
    "https://raw.githubusercontent.com/dawn475/project/23025b1beead3bd9b8f2b308b207020dc4ace85c/placeholder_swamp.jpg",
  tundra:
    "https://raw.githubusercontent.com/dawn475/project/23025b1beead3bd9b8f2b308b207020dc4ace85c/placeholder_tundra.jpg",
};

// Update the background image and UI mode
function updateBackground() {
  const biome = document.getElementById("biomeSelect").value;
  const mode = document.getElementById("uiModeSelect").value;

  const bgImage = biomeImages[biome] || "";
  document.body.style.backgroundImage = `url('${bgImage}')`;

  // Clear any previous UI mode class
  document.body.classList.remove("light", "mid", "dark");
  document.body.classList.add(mode);
}

// Replace main content when a tab is selected
function navigateTo(section) {
  const main = document.getElementById("mainContent");
  let content = "";

  switch (section) {
    case "camp":
      content = `
        <h2>Welcome to ClanLife</h2>
        <p>Create an account or log in to start managing your clan.</p>
        <button>Log In</button>
        <button>Sign Up</button>
      `;
      break;
    case "explore":
      content = `<h2>Explore</h2><p>Search the territory for herbs, prey, and events.</p>`;
      break;
    case "inventory":
      content = `<h2>Inventory</h2><p>View your gathered items, herbs, and treasures.</p>`;
      break;
    case "crossroads":
      content = `<h2>Crossroads</h2><p>Meet new cats or interact with neighboring clans.</p>`;
      break;
    default:
      content = `<h2>${section}</h2><p>Content coming soon...</p>`;
  }

  main.innerHTML = content;
}

// Set up the default view on first load
window.onload = updateBackground;

// ==== Firebase Configuration ====
const firebaseConfig = {
  apiKey: "AIzaSyCYMR8LL_cfHNswh7nU8l4gwxWxKmiJOjc",
  authDomain: "clanlife-project.firebaseapp.com",
  projectId: "clanlife-project",
  storageBucket: "clanlife-project.appspot.com",
  messagingSenderId: "553812082452",
  appId: "1:553812082452:web:0bb5f381c2d7b113d48c01",
  measurementId: "G-4PPGL63VKN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
