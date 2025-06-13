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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const authContainer = document.getElementById("auth-container");
const gameContainer = document.getElementById("game-container");
const authMessage = document.getElementById("auth-message");

// Buttons
document.getElementById("signup-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      authMessage.textContent = "Signed up successfully!";
    })
    .catch(error => {
      authMessage.textContent = error.message;
    });
});

document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      authMessage.textContent = "";
    })
    .catch(error => {
      authMessage.textContent = error.message;
    });
});

auth.onAuthStateChanged(user => {
  if (user) {
    authContainer.style.display = "none";
    gameContainer.style.display = "block";
    loadInventory();
  } else {
    authContainer.style.display = "block";
    gameContainer.style.display = "none";
  }
});

function logout() {
  auth.signOut();
}

function collectItem() {
  const items = ["Feather", "Shiny Rock", "Berry", "Leaf", "Mouse Bone"];
  const item = items[Math.floor(Math.random() * items.length)];
  document.getElementById("item-result").textContent = `You found a ${item}!`;
  saveItemToInventory(item);
}

function saveItemToInventory(item) {
  const user = auth.currentUser;
  if (!user) return;

  const userInvRef = db.collection("inventories").doc(user.uid);
  userInvRef.set({
    items: firebase.firestore.FieldValue.arrayUnion(item)
  }, { merge: true });

  loadInventory();
}

function loadInventory() {
  const user = auth.currentUser;
  if (!user) return;

  const userInvRef = db.collection("inventories").doc(user.uid);
  userInvRef.get().then(doc => {
    const list = document.getElementById("inventory-list");
    list.innerHTML = "";
    if (doc.exists && doc.data().items) {
      doc.data().items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
    }
  });
}
