// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCYMR8LL_cfHNswh7nU8l4gwxWxKmiJOjc",
  authDomain: "clanlife-project.firebaseapp.com",
  projectId: "clanlife-project",
  storageBucket: "clanlife-project.firebasestorage.app",
  messagingSenderId: "553812082452",
  appId: "1:553812082452:web:0bb5f381c2d7b113d48c01",
  measurementId: "G-4PPGL63VKN"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("auth-message");
const gameContainer = document.getElementById("game-container");
const authContainer = document.getElementById("auth-container");
const inventoryList = document.getElementById("inventory-list");

let currentUser = null;
let userInventory = [];
let userDens = [];

// Auth
signupBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      message.textContent = "Signup successful!";
      saveInventory([]);
      saveDens([]);
    })
    .catch(error => {
      message.textContent = error.message;
    });
});

loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      message.textContent = "";
    })
    .catch(error => {
      message.textContent = error.message;
    });
});

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    showGame();
    loadInventory();
    loadDens();
  } else {
    showAuth();
  }
});

function logout() {
  auth.signOut();
}

// UI switching
function showGame() {
  authContainer.style.display = "none";
  gameContainer.style.display = "block";
}

function showAuth() {
  authContainer.style.display = "block";
  gameContainer.style.display = "none";
}

function showTab(tabName) {
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.style.display = "none";
  });
  document.getElementById(tabName).style.display = "block";
}

// Exploration logic
function collectItem() {
  const items = ["Feather", "Shiny Stone", "Leaf", "Berry"];
  const item = items[Math.floor(Math.random() * items.length)];
  userInventory.push(item);
  document.getElementById("item-result").textContent = `You found a ${item}!`;
  updateInventoryUI();
  saveInventory(userInventory);
}

function updateInventoryUI() {
  inventoryList.innerHTML = "";
  userInventory.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    inventoryList.appendChild(li);
  });
}

function saveInventory(inventory) {
  if (!currentUser) return;
  db.collection("users").doc(currentUser.uid).set({ inventory }, { merge: true });
}

function loadInventory() {
  if (!currentUser) return;
  db.collection("users").doc(currentUser.uid).get()
    .then(doc => {
      if (doc.exists) {
        userInventory = doc.data().inventory || [];
        updateInventoryUI();
      }
    });
}

// Den system
function createDen() {
  const input = document.getElementById("den-name-input");
  const name = input.value.trim();
  if (!name) return;

  userDens.push(name);
  input.value = "";
  updateDenUI();
  saveDens(userDens);
}

function updateDenUI() {
  const denList = document.getElementById("den-list");
  denList.innerHTML = "";
  userDens.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    denList.appendChild(li);
  });
}

function saveDens(dens) {
  if (!currentUser) return;
  db.collection("users").doc(currentUser.uid).set({ dens }, { merge: true });
}

function loadDens() {
  if (!currentUser) return;
  db.collection("users").doc(currentUser.uid).get()
    .then(doc => {
      if (doc.exists) {
        userDens = doc.data().dens || [];
        updateDenUI();
      }
    });
}
