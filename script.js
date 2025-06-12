// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let userData = {
  biome: null,
  dens: 1,
  nursery: 1,
  inventory: [],
  campLimit: 10
};

// UI Mode switching
document.getElementById("uiModeSelect").addEventListener("change", (e) => {
  document.body.className = e.target.value;
});

// Biome Descriptions
const biomeDescriptions = {
  forest: "A lush biome with dense trees and mossy undergrowth.",
  coast: "Windswept beaches and salty breezes greet you here.",
  mountains: "High peaks and cold winds challenge your Clan.",
  plains: "Open fields offer little cover but plenty of prey.",
  swamp: "Murky waters and fog create mystery and danger.",
  tundra: "Snow blankets the land and survival is harsh."
};

// Biome selection logic
const biomeSelect = document.getElementById("biomeSelect");
const biomeDescription = document.getElementById("biomeDescription");
const confirmBiome = document.getElementById("confirmBiome");
const appRoot = document.getElementById("appRoot");

biomeSelect.addEventListener("change", () => {
  const biome = biomeSelect.value;
  biomeDescription.textContent = biomeDescriptions[biome] || "";
});

confirmBiome.addEventListener("click", () => {
  const selectedBiome = biomeSelect.value;
  if (!selectedBiome) return alert("Please select a biome.");
  userData.biome = selectedBiome;
  saveData();
  document.getElementById("chooseBiomeScreen").style.display = "none";
  appRoot.style.display = "block";
  navigateTo("camp");
});

// Navigation
function navigateTo(view) {
  const main = document.getElementById("mainContent");
  if (view === "camp") {
    main.innerHTML = `
      <h2>Camp</h2>
      <div class="camp-status">
        <p>Biome: ${userData.biome}</p>
        <p>Dens: ${userData.dens}</p>
        <p>Nursery: ${userData.nursery}</p>
        <p>Camp Space Used: ${userData.dens + userData.nursery}/${userData.campLimit}</p>
      </div>
    `;
  } else if (view === "inventory") {
    main.innerHTML = `
      <h2>Inventory</h2>
      <div class="inventory-list">
        ${userData.inventory.length === 0 ? "<p>No items collected yet.</p>" : `<ul>${userData.inventory.map(item => `<li>${item}</li>`).join("")}</ul>`}
      </div>
    `;
  } else if (view === "explore") {
    main.innerHTML = `
      <h2>Explore</h2>
      <p>Click the button to explore and find items!</p>
      <button class="collect-btn" onclick="explore()">Explore</button>
    `;
  } else {
    main.innerHTML = `<h2>Crossroads</h2><p>Coming soon...</p>`;
  }
}

// Exploration Logic
function explore() {
  const items = ["Moss", "Twigs", "Feather", "Stone", "Bark"];
  const found = items[Math.floor(Math.random() * items.length)];
  userData.inventory.push(found);
  saveData();
  alert(`You found: ${found}`);
  navigateTo("inventory");
}

// Save Data to Firebase
function saveData() {
  const user = auth.currentUser;
  if (!user) return;
  db.collection("users").doc(user.uid).set(userData);
}

// Load Data from Firebase
function loadData() {
  const user = auth.currentUser;
  if (!user) return;
  db.collection("users").doc(user.uid).get().then(doc => {
    if (doc.exists) {
      userData = doc.data();
    }
    if (!userData.biome) {
      document.getElementById("chooseBiomeScreen").style.display = "flex";
    } else {
      appRoot.style.display = "block";
      navigateTo("camp");
    }
  });
}

// Auto-login Anonymous
auth.onAuthStateChanged(user => {
  if (user) {
    loadData();
  } else {
    auth.signInAnonymously().catch(console.error);
  }
});
