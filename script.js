/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  1.  Firebase initialisation                                        ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
const firebaseConfig = {
  apiKey:            "AIzaSyCYMR8LL_cfHNswh7nU8l4gwxWxKmiJOjc",
  authDomain:        "clanlife-project.firebaseapp.com",
  projectId:         "clanlife-project",
  storageBucket:     "clanlife-project.appspot.com",
  messagingSenderId: "553812082452",
  appId:             "1:553812082452:web:0bb5f381c2d7b113d48c01",
  measurementId:     "G-4PPGL63VKN"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  2.  Static data                                                    ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
const biomeDescriptions = {
  forest:    "Dense trees and filtered sunlight. A traditional and balanced home.",
  coast:     "Salty breezes and shifting sands. Ideal for agile and curious cats.",
  mountains: "Rocky heights and thin air. Suits the tough and resilient.",
  plains:    "Open skies and golden grasses. Great for swift, observant cats.",
  swamp:     "Misty marshes full of secrets. Favored by stealthy and clever cats.",
  tundra:    "Harsh cold and endless white. Only the most resourceful survive here."
};

const catNames = ["Ash", "Breeze", "Cinder", "Dusk", "Ember", "Fern", "Gale", "Hollow",
                  "Ivy", "Jade", "Kite", "Lark", "Moss", "Night", "Opal", "Pine",
                  "Quartz", "Raven", "Sage", "Thistle"];
const suffixes = ["fur", "claw", "tail", "whisker", "pelt", "step", "fang", "shade", "leap", "gaze"];
const traits = ["Loyal", "Clever", "Brave", "Cautious", "Kind", "Strong", "Stealthy", "Curious", "Wise", "Impulsive"];

// Starting camp limits
const MAX_CAMP_SPACES = 10;
const MAX_DENS = 3;  // 1 starting den + 2 buildable dens
const NURSERY_CAPACITY = 1;  // one nursery den

// Initial materials needed to build den
const MATERIALS_REQUIRED_PER_DEN = 5;

let currentClan = [];
let rerollCount = 2;
let clanName = "";
let playerCamp = {
  densBuilt: 1,   // player starts with 1 den built
  nurseryBuilt: true, // nursery always built once clan created
  materials: 0    // materials gathered to build dens
};

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  3.  Cat generation                                                 ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function generateCat(role) {
  const name = randomFromArray(catNames) + randomFromArray(suffixes);
  const traitCount = Math.random() < 0.5 ? 1 : 2;
  const catTraits = [];
  while (catTraits.length < traitCount) {
    const trait = randomFromArray(traits);
    if (!catTraits.includes(trait)) catTraits.push(trait);
  }
  return { name, role, traits: catTraits };
}

function generateClan() {
  const totalCats = 10;
  const warriors = randomInt(4, 8);
  const apprentices = randomInt(2, 4);
  const eldersMax = Math.min(2, totalCats - warriors - apprentices);
  const elders = randomInt(0, eldersMax);
  const queensMax = Math.min(3, totalCats - warriors - apprentices - elders);
  const queens = randomInt(0, queensMax);
  const kits = totalCats - warriors - apprentices - elders - queens;

  let clan = [];
  for (let i = 0; i < warriors; i++) clan.push(generateCat("Warrior"));
  for (let i = 0; i < apprentices; i++) clan.push(generateCat("Apprentice"));
  for (let i = 0; i < elders; i++) clan.push(generateCat("Elder"));
  for (let i = 0; i < queens; i++) clan.push(generateCat("Queen"));
  for (let i = 0; i < kits; i++) clan.push(generateCat("Kit"));

  return shuffleArray(clan);
}

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffleArray(arr) {
  const array = arr.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  4.  DOM Setup & Clan Selection UI                                 ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
const biomeSelect = document.getElementById("biomeSelect");
const biomeDesc = document.getElementById("biomeDescription");
const confirmBiome = document.getElementById("confirmBiome");
const chooseScreen = document.getElementById("chooseBiomeScreen");
const appRoot = document.getElementById("appRoot");
const mainArea = document.getElementById("mainContent");

let clanDisplayContainer = null;
let rerollBtn = null;

biomeSelect.addEventListener("change", () => {
  biomeDesc.textContent = biomeDescriptions[biomeSelect.value] ?? "";
});

confirmBiome.addEventListener("click", async () => {
  const biome = biomeSelect.value;
  const user = auth.currentUser;
  if (!biome) return alert("Choose a biome first.");
  if (!user) return alert("Please log in.");

  if (!clanDisplayContainer) {
    clanDisplayContainer = document.createElement("div");
    chooseScreen.querySelector(".modal-box").appendChild(clanDisplayContainer);
  }

  if (!rerollBtn) {
    rerollBtn = document.createElement("button");
    rerollBtn.textContent = `Reroll Clan (${rerollCount} left)`;
    rerollBtn.style.marginTop = "1rem";
    chooseScreen.querySelector(".modal-box").appendChild(rerollBtn);
    rerollBtn.addEventListener("click", () => {
      if (rerollCount <= 0) return alert("No rerolls left!");
      currentClan = generateClan();
      displayClan(currentClan);
      rerollCount--;
      rerollBtn.textContent = `Reroll Clan (${rerollCount} left)`;
    });
  }

  if (currentClan.length === 0) {
    currentClan = generateClan();
  }

  // Reset camp when new clan created
  playerCamp = {
    densBuilt: 1,
    nurseryBuilt: true,
    materials: 0
  };

  displayClan(currentClan);

  if (!confirmBiome.dataset.clanLocked) {
    const lockBtn = document.createElement("button");
    lockBtn.textContent = "Confirm Biome and Clan";
    lockBtn.style.marginTop = "1rem";
    chooseScreen.querySelector(".modal-box").appendChild(lockBtn);

    lockBtn.addEventListener("click", async () => {
      clanName = prompt("Name your clan:");
      if (!clanName || clanName.trim().length < 2) {
        alert("Clan name must be at least 2 characters.");
        return;
      }

      try {
        await db.doc(`users/${user.uid}`).set(
          {
            biome,
            clan: currentClan,
            clanName: clanName.trim(),
            playerCamp
          },
          { merge: true }
        );
        localStorage.setItem("selectedBiome", biome);
        localStorage.setItem("clanName", clanName.trim());
        document.body.setAttribute("data-biome", biome);
        chooseScreen.style.display = "none";
        appRoot.style.display = "block";
        navigateTo("camp");
      } catch (err) {
        console.error(err);
        alert("Couldn’t save clan. Try again.");
      }
    });

    confirmBiome.dataset.clanLocked = "true";
    confirmBiome.style.display = "none";
  }
});

function displayClan(clan) {
  if (!clanDisplayContainer) return;

  clanDisplayContainer.innerHTML = "<h3>Your Clan (10 cats):</h3>";
  const ul = document.createElement("ul");

  clan.forEach(cat => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${cat.name}</strong> — ${cat.role}<br><em>Traits:</em> ${cat.traits.join(", ")}`;
    ul.appendChild(li);
  });

  clanDisplayContainer.appendChild(ul);
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  5.  Navigation and UI Mode Switching                              ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
const uiModeSel = document.getElementById("uiModeSelect");
uiModeSel.addEventListener("change", () => {
  document.body.classList.remove("light", "mid", "dark");
  document.body.classList.add(uiModeSel.value);
});

function navigateTo(page) {
  if(page === "camp") {
    renderCampPage();
  } else {
    const pages = {
      explore: "<h2>Explore</h2><p>Search the territory…</p>",
      inventory: "<h2>Inventory</h2><p>Here are your items…</p>",
      crossroads: "<h2>Crossroads</h2><p>Meet neighbouring clans…</p>"
    };
    mainArea.innerHTML = pages[page] ?? "<h2>Coming soon…</h2>";
  }
}

/**
 * Render the camp page with dens, nursery, clan cats, materials, and building controls.
 */
function renderCampPage() {
  let campHtml = `<h2>${clanName || "Your"} Clan Camp</h2>`;
  campHtml += `<p>Camp Space: ${currentClan.length} / ${MAX_CAMP_SPACES}</p>`;
  campHtml += `<p>Materials gathered: ${playerCamp.materials}</p>`;

  // Dens built display
  campHtml += `<div><h3>Dens</h3><p>You have built <strong>${playerCamp.densBuilt}</strong> dens (max ${MAX_DENS})</p>`;
  campHtml += `<button id="buildDenBtn" ${playerCamp.densBuilt >= MAX_DENS || playerCamp.materials < MATERIALS_REQUIRED_PER_DEN ? "disabled" : ""}>Build a New Den (${MATERIALS_REQUIRED_PER_DEN} materials)</button></div>`;

  // Nursery info
  campHtml += `<div><h3>Nursery</h3><p>${playerCamp.nurseryBuilt ? "A nursery den is set up for expecting queens." : "No nursery den built yet."}</p></div>`;

  // Clan cats list
  campHtml += `<div><h3>Clan Cats (${currentClan.length} cats)</h3><ul>`;
  currentClan.forEach(cat => {
    campHtml += `<li><strong>${cat.name}</strong> — ${cat.role} (${cat.traits.join(", ")})</li>`;
  });
  campHtml += "</ul></div>";

  // Materials gather button
  campHtml += `<button id="gatherMaterialsBtn">Gather Materials</button>`;

  mainArea.innerHTML = campHtml;

  // Add event listeners to buttons
  document.getElementById("gatherMaterialsBtn").addEventListener("click", () => {
    gatherMaterials();
  });

  const buildDenBtn = document.getElementById("buildDenBtn");
  if(buildDenBtn) {
    buildDenBtn.addEventListener("click", () => {
      buildDen();
    });
  }
}

/**
 * Simulate gathering materials (adds 1-3 materials)
 */
function gatherMaterials() {
  const gained = randomInt(1, 3);
  playerCamp.materials += gained;
  alert(`You gathered ${gained} materials.`);
  savePlayerCamp();
  renderCampPage();
}

/**
 * Build a new den if possible
 */
function buildDen() {
  if(playerCamp.materials < MATERIALS_REQUIRED_PER_DEN) {
    alert("Not enough materials to build a den.");
    return;
  }
  if(playerCamp.densBuilt >= MAX_DENS) {
    alert("You have reached the maximum number of dens.");
    return;
  }
  playerCamp.materials -= MATERIALS_REQUIRED_PER_DEN;
  playerCamp.densBuilt++;
  alert("You built a new den!");
  savePlayerCamp();
  renderCampPage();
}

/**
 * Save playerCamp data back to Firestore and local state
 */
async function savePlayerCamp() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await db.doc(`users/${user.uid}`).set(
      { playerCamp },
      { merge: true }
    );
  } catch(err) {
    console.error("Error saving camp data:", err);
  }
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  6.  Firebase auth state listener                                   ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
auth.onAuthStateChanged(async user => {
  if (!user) {
    appRoot.style.display = "none";
    chooseScreen.style.display = "none";
    authModal.style.display = "flex";
    setAuthMode("login");
    return;
  }

  try {
    const snap = await db.doc(`users/${user.uid}`).get();
    const data = snap.data() || {};
    if (!data.biome || !data.clan || !data.clanName) {
      authModal.style.display = "none";
      appRoot.style.display = "none";
      chooseScreen.style.display = "flex";
      biomeSelect.value = "";
      biomeDesc.textContent = "";
      currentClan = [];
      rerollCount = 2;
      playerCamp = {
        densBuilt: 1,
        nurseryBuilt: true,
        materials: 0
      };
      if (clanDisplayContainer) clanDisplayContainer.innerHTML = "";
      if (rerollBtn) rerollBtn.textContent = `Reroll Clan (${rerollCount} left)`;
      confirmBiome.style.display = "inline-block";
      delete confirmBiome.dataset.clanLocked;
    } else {
      currentClan = data.clan;
      clanName = data.clanName;
      playerCamp = data.playerCamp || {
        densBuilt: 1,
        nurseryBuilt: true,
        materials: 0
      };
      document.body.setAttribute("data-biome", data.biome);
      localStorage.setItem("selectedBiome", data.biome);
      localStorage.setItem("clanName", data.clanName);
      chooseScreen.style.display = "none";
      appRoot.style.display = "block";
      authModal.style.display = "none";
      navigateTo("camp");
    }
  } catch (err) {
    console.error("Error loading user data:", err);
  }
});
