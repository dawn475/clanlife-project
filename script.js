// Your Firebase config
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
const db = firebase.firestore();

// DOM Elements
const generateClanBtn = document.getElementById('generateClanBtn');
const tabCamp = document.getElementById('tabCamp');
const tabInventory = document.getElementById('tabInventory');
const campContent = document.getElementById('campContent');
const inventoryContent = document.getElementById('inventoryContent');
const inventoryList = document.getElementById('inventoryList');

let currentClan = null;
let currentInventory = [];

// Tab switching
function switchTab(tabName) {
  if (tabName === 'camp') {
    tabCamp.classList.add('active');
    tabInventory.classList.remove('active');
    campContent.classList.add('active');
    inventoryContent.classList.remove('active');
  } else if (tabName === 'inventory') {
    tabCamp.classList.remove('active');
    tabInventory.classList.add('active');
    campContent.classList.remove('active');
    inventoryContent.classList.add('active');
  }
}

tabCamp.addEventListener('click', () => switchTab('camp'));
tabInventory.addEventListener('click', () => switchTab('inventory'));

// Generate a clan with up to 10 cats (simplified example)
function generateClan() {
  // Example cat data generation
  const catNames = ['Starfire', 'Ashpaw', 'Moonclaw', 'Brightleaf', 'Stormtail', 'Sunwhisker', 'Mistfur', 'Shadowstep', 'Goldengaze', 'Frostpelt'];
  const roles = ['Leader', 'Deputy', 'Medicine Cat', 'Warrior', 'Apprentice', 'Elder', 'Queen'];

  const cats = [];

  for (let i = 0; i < 10; i++) {
    cats.push({
      name: catNames[i],
      role: roles[Math.floor(Math.random() * roles.length)],
    });
  }

  const clanData = {
    cats: cats,
    createdAt: new Date().toISOString(),
  };

  // Save clan to Firestore
  db.collection('clans').add(clanData)
    .then(docRef => {
      console.log("Clan saved with ID:", docRef.id);
      alert("Clan generated and saved!");
      currentClan = clanData;
      displayClan(currentClan);
    })
    .catch(error => {
      console.error("Error saving clan:", error);
      alert("Failed to generate clan. Check console.");
    });
}

// Display clan cats in Camp tab
function displayClan(clan) {
  campContent.innerHTML = '<h2>Camp</h2><h3>Clan Cats:</h3>';
  clan.cats.forEach(cat => {
    const p = document.createElement('p');
    p.textContent = `${cat.name} - ${cat.role}`;
    campContent.appendChild(p);
  });
}

// Inventory management
function displayInventory() {
  inventoryList.innerHTML = '';

  if (currentInventory.length === 0) {
    inventoryList.innerHTML = '<li>No items collected yet.</li>';
    return;
  }

  currentInventory.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} (x${item.quantity})`;
    inventoryList.appendChild(li);
  });
}

// Simulate item collection (you can call this function during exploration)
function collectItem(itemName) {
  const existingItem = currentInventory.find(item => item.name === itemName);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    currentInventory.push({ name: itemName, quantity: 1 });
  }
  saveInventory();
  displayInventory();
}

// Save inventory to Firestore (you can customize based on user ID)
function saveInventory() {
  // For this example, saving under a fixed document (you should adapt this for users)
  db.collection('inventory').doc('userInventory').set({
    items: currentInventory,
    updatedAt: new Date().toISOString(),
  })
  .then(() => {
    console.log("Inventory saved.");
  })
  .catch(error => {
    console.error("Error saving inventory:", error);
  });
}

// Load inventory from Firestore on page load
function loadInventory() {
  db.collection('inventory').doc('userInventory').get()
    .then(doc => {
      if (doc.exists) {
        currentInventory = doc.data().items || [];
      } else {
        currentInventory = [];
      }
      displayInventory();
    })
    .catch(error => {
      console.error("Error loading inventory:", error);
    });
}

// Initial setup
generateClanBtn.addEventListener('click', generateClan);
loadInventory();
switchTab('camp');

// Example: Simulate collecting an item every 15 seconds (for testing)
setInterval(() => {
  const possibleItems = ['Herb', 'Fish', 'Rabbit Foot', 'Feather', 'Shiny Stone'];
  const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
  collectItem(randomItem);
  console.log(`Collected item: ${randomItem}`);
}, 15000);
