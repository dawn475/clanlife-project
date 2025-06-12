const mainArea = document.getElementById("main-area");

let clanName = "Sunclan"; // Optional: user-defined
let campLimit = 10;
let builtDens = 1;
const maxDens = 3;

let inventory = {
  wood: 5,
  moss: 3,
  stone: 2
};

let currentClan = [
  { name: "Virelai", role: "Leader", traits: ["Wise", "Fierce"] },
  { name: "Astreia", role: "Warrior", traits: ["Loyal", "Curious"] },
  { name: "Stratus", role: "Queen", traits: ["Calm", "Gentle"] },
  { name: "Thornkit", role: "Kit", traits: ["Playful"] }
];

// Utility
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Main Navigation
function navigateTo(page) {
  const pages = {
    camp: renderCamp,
    explore: renderExplore,
    inventory: renderInventory,
    crossroads: renderCrossroads
  };
  (pages[page] || renderComingSoon)();
}

// Camp UI
function renderCamp() {
  const nurseryCats = currentClan.filter(cat => cat.role === "Queen");

  let html = `<h2>${clanName || "Your"} Camp</h2>`;
  html += `<p><strong>Camp Space:</strong> ${currentClan.length} / ${campLimit}</p>`;
  html += `<p><strong>Dens:</strong> ${builtDens} / ${maxDens}</p>`;

  html += `<h3>Dens</h3><ul>`;
  for (let i = 1; i <= builtDens; i++) {
    html += `<li>Den ${i}</li>`;
  }
  html += `</ul>`;

  html += `<h3>Nursery</h3>`;
  if (nurseryCats.length > 0) {
    html += `<ul>`;
    nurseryCats.forEach(cat => {
      html += `<li><strong>${cat.name}</strong> — ${cat.traits.join(", ")}</li>`;
    });
    html += `</ul>`;
  } else {
    html += `<p>No expecting queens at the moment.</p>`;
  }

  if (builtDens < maxDens && currentClan.length < campLimit) {
    html += `
      <button onclick="buildDen()">Build Another Den</button>
      <p>Costs: 3 wood, 2 moss, 1 stone</p>
    `;
  }

  mainArea.innerHTML = html;
}

// Inventory UI
function renderInventory() {
  let html = `<h2>Inventory</h2><ul>`;
  for (const item in inventory) {
    html += `<li><strong>${item}</strong>: ${inventory[item]}</li>`;
  }
  html += `</ul><button onclick="gatherMaterials()">Gather Materials</button>`;
  mainArea.innerHTML = html;
}

// Explore Page (Placeholder)
function renderExplore() {
  mainArea.innerHTML = `
    <h2>Explore</h2>
    <p>Search the territory to find materials and events. (Coming soon!)</p>
  `;
}

// Crossroads Page (Placeholder)
function renderCrossroads() {
  mainArea.innerHTML = `
    <h2>Crossroads</h2>
    <p>Connect with nearby clans and wanderers. (Coming soon!)</p>
  `;
}

// Coming Soon Fallback
function renderComingSoon() {
  mainArea.innerHTML = "<h2>Coming soon…</h2>";
}

// Den Builder
function buildDen() {
  if (inventory.wood >= 3 && inventory.moss >= 2 && inventory.stone >= 1) {
    inventory.wood -= 3;
    inventory.moss -= 2;
    inventory.stone -= 1;
    builtDens++;
    alert("A new den has been built!");
    renderCamp();
  } else {
    alert("Not enough materials!");
  }
}

// Simulated Gathering
function gatherMaterials() {
  const gain = {
    wood: randomInt(0, 2),
    moss: randomInt(0, 1),
    stone: randomInt(0, 1)
  };
  for (const item in gain) {
    inventory[item] += gain[item];
  }
  alert(`You gathered materials!\n+${gain.wood} wood, +${gain.moss} moss, +${gain.stone} stone`);
  renderInventory();
}
