// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCYMR8LL_cfHNswh7nU8l4gwxWxKmiJOjc",
  authDomain: "clanlife-project.firebaseapp.com",
  projectId: "clanlife-project",
  storageBucket: "clanlife-project.firebasestorage.app",
  messagingSenderId: "553812082452",
  appId: "1:553812082452:web:0bb5f381c2d7b113d48c01",
  measurementId: "G-4PPGL63VKN",
  databaseURL: "https://clanlife-project-default-rtdb.firebaseio.com"
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
