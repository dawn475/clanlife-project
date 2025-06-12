/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  1.  Firebase initialisation                                       ║
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

const catNames = ["Ash","Breeze","Cinder","Dusk","Ember","Fern","Gale","Hollow",
                  "Ivy","Jade","Kite","Lark","Moss","Night","Opal","Pine",
                  "Quartz","Raven","Sage","Thistle"];
const suffixes = ["fur","claw","tail","whisker","pelt","step","fang","shade","leap","gaze"];

let currentClan = [];
let rerollCount = 2;

function generateCat(role) {
  const name = catNames[Math.floor(Math.random() * catNames.length)] +
               suffixes[Math.floor(Math.random() * suffixes.length)];
  return { name, role };
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
   ║  3.  DOM references                                                 ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
const authModal   = document.getElementById("authModal");
const authTitle   = document.getElementById("authTitle");
const emailInput  = document.getElementById("authEmail");
const passInput   = document.getElementById("authPass");
const authSubmit  = document.getElementById("authSubmit");
const authToggle  = document.getElementById("authToggle");
const authError   = document.getElementById("authError");

const chooseScreen = document.getElementById("chooseBiomeScreen");
let biomeSelect    = document.getElementById("biomeSelect");
let biomeDesc      = document.getElementById("biomeDescription");
let confirmBiome   = document.getElementById("confirmBiome");

const appRoot   = document.getElementById("appRoot");
const uiModeSel = document.getElementById("uiModeSelect");
const mainArea  = document.getElementById("mainContent");

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  4.  UI helpers                                                     ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function navigateTo(page) {
  const pages = {
    camp:       "<h2>Clan Camp</h2><p>Your cats are resting…</p>",
    explore:    "<h2>Explore</h2><p>Search the territory…</p>",
    inventory:  "<h2>Inventory</h2><p>Here are your items…</p>",
    crossroads: "<h2>Crossroads</h2><p>Meet neighbouring clans…</p>"
  };
  mainArea.innerHTML = pages[page] ?? "<h2>Coming soon…</h2>";
}

uiModeSel.addEventListener("change", () => {
  document.body.classList.remove("light", "mid", "dark");
  document.body.classList.add(uiModeSel.value);
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  5.  Biome selection + clan generation                              ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
let clanDisplayContainer = null;
let rerollBtn = null;

biomeSelect.addEventListener("change", () => {
  biomeDesc.textContent = biomeDescriptions[biomeSelect.value] ?? "";
});

confirmBiome.addEventListener("click", async () => {
  const biome = biomeSelect.value;
  if (!biome) return alert("Please choose a biome first.");

  const user = auth.currentUser;
  if (!user) return alert("You need to be logged in.");

  if (!clanDisplayContainer) {
    clanDisplayContainer = document.createElement("div");
    clanDisplayContainer.style.marginTop = "1rem";
    chooseScreen.querySelector(".modal-box").appendChild(clanDisplayContainer);
  }

  if (!rerollBtn) {
    rerollBtn = document.createElement("button");
    rerollBtn.textContent = `Reroll Clan (${rerollCount} left)`;
    rerollBtn.style.marginTop = "1rem";
    rerollBtn.style.display = "block";
    chooseScreen.querySelector(".modal-box").appendChild(rerollBtn);

    rerollBtn.addEventListener("click", () => {
      if (rerollCount <= 0) return alert("No rerolls left!");
      currentClan = generateClan();
      displayClan(currentClan);
      rerollCount--;
      rerollBtn.textContent = `Reroll Clan (${rerollCount} left)`;
      if (rerollCount <= 0) rerollBtn.disabled = true;
    });
  }

  if (currentClan.length === 0) {
    currentClan = generateClan();
  }

  displayClan(currentClan);

  if (!confirmBiome.dataset.clanLocked) {
    const lockBtn = document.createElement("button");
    lockBtn.textContent = "Confirm Biome and Clan";
    lockBtn.style.marginTop = "1rem";
    chooseScreen.querySelector(".modal-box").appendChild(lockBtn);

    lockBtn.addEventListener("click", async () => {
      try {
        await db.doc(`users/${user.uid}`).set({ biome, clan: currentClan }, { merge: true });
        document.body.setAttribute("data-biome", biome);
        localStorage.setItem("selectedBiome", biome);
        chooseScreen.style.display = "none";
        appRoot.style.display = "block";
        navigateTo("camp");
      } catch (err) {
        console.error(err);
        alert("Couldn’t save biome and clan – try again.");
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
    li.textContent = `${cat.name} — ${cat.role}`;
    ul.appendChild(li);
  });

  clanDisplayContainer.appendChild(ul);
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  6.  Auth modal logic                                               ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
let authMode = "login";

function setAuthMode(mode) {
  authMode = mode;
  authTitle.textContent = mode === "login" ? "Log In" : "Sign Up";
  authSubmit.textContent = mode === "login" ? "Log In" : "Create Account";
  authToggle.innerHTML =
    mode === "login"
      ? `Don’t have an account? <a href="#" id="switchToSignUp">Sign Up</a>`
      : `Already have an account? <a href="#" id="switchToLogin">Log In</a>`;
  authError.textContent = "";
}
setAuthMode("login");

authSubmit.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const pass = passInput.value.trim();
  if (!email || !pass) {
    authError.textContent = "Please fill in both fields.";
    return;
  }

  try {
    const cred =
      authMode === "login"
        ? await auth.signInWithEmailAndPassword(email, pass)
        : await auth.createUserWithEmailAndPassword(email, pass);

    if (authMode === "signup") {
      await db.doc(`users/${cred.user.uid}`).set({
        email: cred.user.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        biome: null
      });
    }

    authModal.style.display = "none";
  } catch (err) {
    authError.textContent = err.message;
  }
});

authModal.addEventListener("click", e => {
  if (e.target.id === "switchToSignUp") {
    e.preventDefault();
    setAuthMode("signup");
  }
  if (e.target.id === "switchToLogin") {
    e.preventDefault();
    setAuthMode("login");
  }
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  7.  Firebase auth state listener                                   ║
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

    if (!data.biome || !data.clan) {
      authModal.style.display = "none";
      appRoot.style.display = "none";
      chooseScreen.style.display = "flex";
      biomeSelect.value = "";
      biomeDesc.textContent = "";
      localStorage.removeItem("selectedBiome");
      rerollCount = 2;
      currentClan = [];
      if (rerollBtn) rerollBtn.textContent = `Reroll Clan (${rerollCount} left)`;
      if (rerollBtn) rerollBtn.disabled = false;
      if (clanDisplayContainer) clanDisplayContainer.innerHTML = "";
      confirmBiome.style.display = "inline-block";
      delete confirmBiome.dataset.clanLocked;
    } else {
      document.body.setAttribute("data-biome", data.biome);
      chooseScreen.style.display = "none";
      authModal.style.display = "none";
      appRoot.style.display = "block";
      navigateTo("camp");
      localStorage.setItem("selectedBiome", data.biome);
      currentClan = data.clan || [];
    }
  } catch (err) {
    console.error("Error loading user data:", err);
    authModal.style.display = "flex";
    appRoot.style.display = "none";
    chooseScreen.style.display = "none";
  }
});
