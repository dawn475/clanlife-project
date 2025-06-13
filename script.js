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

// Elements
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

signupBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      message.textContent = "Signup successful!";
      saveInventory([]);
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
  } else {
    showAuth();
  }
});

function logout() {
  auth.signOut();
}

function showGame() {
  authContainer.style.display = "none";
  gameContainer.style.display = "block";
  showTab('camp');
}

function showAuth() {
  authContainer.style.display = "block";
  gameContainer.style.display = "none";
}

function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.style.display = "none";
  });
  document.getElementById(tabId).style.display = "block";
}

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
  db.collection("users").doc(currentUser.uid).set({ inventory });
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
function showTab(tabId) {
  const allTabs = document.querySelectorAll(".tab-content");
  allTabs.forEach(tab => {
    tab.style.display = (tab.id === tabId) ? "block" : "none";
  });
}
