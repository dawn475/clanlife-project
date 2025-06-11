// Biome images
const biomeImages = {
  coast:    "images/placeholder_coast.jpg",
  forest:   "images/placeholder_forest.jpg",
  mountains:"images/placeholder_mountains.jpg",
  plains:   "images/placeholder_plains.jpg",
  swamp:    "images/placeholder_swamp.jpg",
  tundra:   "images/placeholder_tundra.jpg"
};

// Firebase Init
const firebaseConfig = {
  apiKey: "AIzaSyCYMR8LL_cfHNswh7nU8l4gwxWxKmiJOjc",
  authDomain: "clanlife-project.firebaseapp.com",
  projectId: "clanlife-project",
  storageBucket: "clanlife-project.appspot.com",
  messagingSenderId: "553812082452",
  appId: "1:553812082452:web:0bb5f381c2d7b113d48c01"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const appRoot = document.getElementById("appRoot");
const modal = document.getElementById("authModal");
const title = document.getElementById("authTitle");
const emailIn = document.getElementById("authEmail");
const passIn = document.getElementById("authPass");
const submitBtn = document.getElementById("authSubmit");
const toggleTxt = document.getElementById("authToggle");
const errBox = document.getElementById("authError");
const biomeSelect = document.getElementById("biomeSelect");
const uiModeSelect = document.getElementById("uiModeSelect");
const chooseBiomeScreen = document.getElementById("chooseBiomeScreen");
const confirmBiomeBtn = document.getElementById("confirmBiome");

let mode = "login";

// Switch modal state
function setMode(m) {
  mode = m;
  title.textContent = m === "login" ? "Log In" : "Sign Up";
  submitBtn.textContent = m === "login" ? "Log In" : "Create Account";
  toggleTxt.innerHTML = m === "login"
    ? `Don’t have an account? <a href="#" id="switchToSignUp">Sign Up</a>`
    : `Already have an account? <a href="#" id="switchToLogin">Log In</a>`;
}

function showError(msg) {
  errBox.textContent = msg;
}

// Auth submit
submitBtn.onclick = async () => {
  const email = emailIn.value.trim();
  const pass = passIn.value.trim();
  if (!email || !pass) return showError("Please fill in both fields.");

  try {
    const result = mode === "login"
      ? await auth.signInWithEmailAndPassword(email, pass)
      : await auth.createUserWithEmailAndPassword(email, pass);

    const uid = result.user.uid;

    if (mode === "signup") {
      await db.collection("users").doc(uid).set({
        homeBiome: null  // Set as null for redirect
      });
    }

    modal.style.display = "none";
  } catch (e) {
    showError(e.message);
  }
};

// Switch modal link
modal.addEventListener("click", (e) => {
  if (e.target.id === "switchToSignUp") {
    e.preventDefault();
    setMode("signup");
  }
  if (e.target.id === "switchToLogin") {
    e.preventDefault();
    setMode("login");
  }
});

// Navigation
function navigateTo(section) {
  const main = document.getElementById("mainContent");
  const pages = {
    camp: `<h2>Welcome to ClanLife</h2><p>Begin your journey…</p>`,
    explore: `<h2>Explore</h2><p>Search the territory…</p>`,
    inventory: `<h2>Inventory</h2><p>View your items…</p>`,
    crossroads: `<h2>Crossroads</h2><p>Meet neighboring clans…</p>`
  };
  main.innerHTML = pages[section] || "<h2>Coming soon…</h2>";
}

// Background Theme
function updateBackground() {
  const biome = biomeSelect.value;
  const mode = uiModeSelect.value;

  document.body.style.backgroundImage = `url('${biomeImages[biome] || ""}')`;
  document.body.setAttribute("data-biome", biome);
  document.body.classList.remove("light", "mid", "dark");
  document.body.classList.add(mode);
}

// Save chosen biome (first login only)
confirmBiomeBtn.addEventListener("click", async () => {
  const biome = biomeSelect.value;
  const user = auth.currentUser;
  if (!user) return;

  try {
    await db.collection("users").doc(user.uid).update({
      homeBiome: biome
    });
    document.body.setAttribute("data-biome", biome);
    updateBackground();
    chooseBiomeScreen.style.display = "none";
    appRoot.style.display = "block";
    navigateTo("camp");
  } catch (e) {
    alert("Error saving biome: " + e.message);
  }
});

// Auth state watcher
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const uid = user.uid;
    const userDoc = await db.collection("users").doc(uid).get();
    const data = userDoc.data();

    if (!data?.homeBiome) {
      // Needs to choose a biome
      appRoot.style.display = "none";
      chooseBiomeScreen.style.display = "flex";
      biomeSelect.value = "forest"; // Default
      updateBackground();
    } else {
      // Biome is locked in
      biomeSelect.value = data.homeBiome;
      document.body.setAttribute("data-biome", data.homeBiome);
      updateBackground();

      modal.style.display = "none";
      appRoot.style.display = "block";
      navigateTo("camp");
    }
  } else {
    appRoot.style.display = "none";
    chooseBiomeScreen.style.display = "none";
    modal.style.display = "flex";
    setMode("login");
  }
});

// Selectors
biomeSelect.addEventListener("change", updateBackground);
uiModeSelect.addEventListener("change", updateBackground);

// Default load
window.addEventListener("DOMContentLoaded", () => {
  updateBackground();
});
