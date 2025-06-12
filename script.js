// Firebase config (replace with your own if needed)
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
const biomeSelectionDiv = document.getElementById('biomeSelection');
const generateClanBtn = document.getElementById('generateClanBtn');
const tabCamp = document.getElementById('tabCamp');
const tabInventory = document.getElementById('tabInventory');
const campContent = document.getElementById('campContent');
const inventoryContent = document.getElementById('inventoryContent');
const inventoryList = document.getElementById('inventoryList');
const tabsDiv = document.querySelector('.tabs');

let currentClan = null;
let currentInventory = [];

// --- Biome Selection ---
document.querySelectorAll('.biomeBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedBiome = btn.dataset.biome;
    localStorage.setItem('selectedBiome', selectedBiome);
    alert(`Biome "${selectedBiome}" selected!`);

    biomeSelectionDiv.style.display = 'none';
    tabsDiv.style.display = 'block';
    generateClanBtn.style.display = 'inline-block';
  });
});

// --- Tab Switching ---
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

// --- Clan Generation ---
function generateClan() {
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
    biome: localStorage.getItem('selectedBiome') || 'unknown'
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

// --- Display Clan ---
function displayClan(clan) {
  campContent.innerHTML = `<h2>Camp</h2><h3>Biome: ${clan.biome}</h3><h3>Clan Cats:</h3>`;
  clan.cats.forEach(cat => {
    const p = document.createElement('p');
    p.textContent = `${cat.name} - ${cat.role}`;
    campContent.appendChild(p);
  });
}

// --- Inventory Display ---
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

// --- Collect Item (simulate exploration) ---
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

// --- Save Inventory to Firestore ---
function saveInventory() {
  // Saving to a fixed doc; ideally you'd use user auth to save per-user
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

// --- Load Inventory from Firestore ---
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

// --- Initial Setup on page load ---
window.onload = () => {
  const biome = localStorage.getItem('selectedBiome');
  if (biome) {
    biomeSelectionDiv.style.display = 'none';
    tabsDiv.style.display = 'block';
    generateClanBtn.style.display = 'inline-block';
  } else {
    biomeSelectionDiv.style.display = 'block';
    tabsDiv.style.display = 'none';
    generateClanBtn.style.display = 'none';
  }

  loadInventory();
  switchTab('camp');
};

// --- Event Listeners ---
generateClanBtn.addEventListener('click', generateClan);

// --- Simulate item collection every 15 seconds ---
setInterval(() => {
  const possibleItems = ['Herb', 'Fish', 'Rabbit Foot', 'Feather', 'Shiny Stone'];
  const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
  collectItem(randomItem);
  console.log(`Collected item: ${randomItem}`);
}, 15000);
