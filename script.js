// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;
let denCount = 0;
let inventory = [];

// Auth functions
function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      alert("Signed up!");
      currentUser = userCredential.user;
      saveData();
      showGame();
    })
    .catch(error => alert(error.message));
}

function logIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      currentUser = userCredential.user;
      loadData();
      showGame();
    })
    .catch(error => alert(error.message));
}

function logOut() {
  auth.signOut().then(() => {
    alert("Logged out.");
    document.getElementById("game-section").style.display = "none";
    document.getElementById("auth-section").style.display = "block";
  });
}

// Show game after login
function showGame() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("game-section").style.display = "block";
}

// Den logic
function createDen() {
  if (denCount < 10) {
    const denDiv = document.createElement("div");
    denDiv.textContent = `Den ${denCount + 1}`;
    document.getElementById("dens").appendChild(denDiv);
    denCount++;
    document.getElementById("denCount").textContent = denCount;
    saveData();
  } else {
    alert("Camp is full. Maximum 10 dens.");
  }
}

// Inventory logic
function collectItem() {
  const items = ["Feather", "Herb", "Shiny Rock", "Insect", "Leaf"];
  const item = items[Math.floor(Math.random() * items.length)];
  inventory.push(item);
  document.getElementById("foundItem").textContent = `You found: ${item}`;
  updateInventory();
  saveData();
}

function updateInventory() {
  const list = document.getElementById("inventoryList");
  list.innerHTML = "";
  inventory.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i;
    list.appendChild(li);
  });
}

// Save to Firebase
function saveData() {
  if (!currentUser) return;
  db.ref("users/" + currentUser.uid).set({
    denCount,
    inventory
  });
}

// Load from Firebase
function loadData() {
  if (!currentUser) return;
  db.ref("users/" + currentUser.uid).once("value").then(snapshot => {
    const data = snapshot.val();
    if (data) {
      denCount = data.denCount || 0;
      inventory = data.inventory || [];
      document.getElementById("denCount").textContent = denCount;
      for (let i = 0; i < denCount; i++) {
        const denDiv = document.createElement("div");
        denDiv.textContent = `Den ${i + 1}`;
        document.getElementById("dens").appendChild(denDiv);
      }
      updateInventory();
    }
  });
}

