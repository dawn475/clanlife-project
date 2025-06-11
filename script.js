/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  Firebase initialisation – replace with your own project settings   ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
/* ── Firebase initialisation ─────────────────────────────────────────── */
// measurementId is optional; you can include it or leave it out.
const firebaseConfig = {
  apiKey:            "AIzaSyCYMR8LL_cfHNswh7nU8l4gwxWxKmiJOjc",
  authDomain:        "clanlife-project.firebaseapp.com",
  projectId:         "clanlife-project",
  storageBucket:     "clanlife-project.appspot.com",   // <- must end with .appspot.com
  messagingSenderId: "553812082452",
  appId:             "1:553812082452:web:0bb5f381c2d7b113d48c01",
  measurementId:     "G-4PPGL63VKN"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  Biome data & helper functions                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
const biomeDescriptions = {
  forest:    "Dense trees and filtered sunlight. A traditional and balanced home.",
  coast:     "Salty breezes and shifting sands. Ideal for agile and curious cats.",
  mountains: "Rocky heights and thin air. Suits the tough and resilient.",
  plains:    "Open skies and golden grasses. Great for swift, observant cats.",
  swamp:     "Misty marshes full of secrets. Favored by stealthy and clever cats.",
  tundra:    "Harsh cold and endless white. Only the most resourceful survive here."
};

function generateClan() {
  const names    = ["Ash","Breeze","Cinder","Dusk","Ember","Fern","Gale","Hollow",
                    "Ivy","Jade","Kite","Lark","Moss","Night","Opal","Pine",
                    "Quartz","Raven","Sage","Thistle"];
  const suffixes = ["fur","claw","tail","whisker","pelt","step","fang","shade","leap","gaze"];
  return Array.from({ length: 10 }, () => ({
    name:
      names[Math.floor(Math.random()*names.length)] +
      suffixes[Math.floor(Math.random()*suffixes.length)]
  }));
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  DOM references                                                     ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
const authModal   = document.getElementById("authModal");
const authTitle   = document.getElementById("authTitle");
const emailInput  = document.getElementById("authEmail");
const passInput   = document.getElementById("authPass");
const authSubmit  = document.getElementById("authSubmit");
const authToggle  = document.getElementById("authToggle");
const authError   = document.getElementById("authError");

const chooseScreen = document.getElementById("chooseBiomeScreen");
const biomeSelect  = document.getElementById("biomeSelect");
const biomeDesc    = document.getElementById("biomeDescription");
const confirmBiome = document.getElementById("confirmBiome");

const appRoot   = document.getElementById("appRoot");
const uiModeSel = document.getElementById("uiModeSelect");
const mainArea  = document.getElementById("mainContent");

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  Basic navigation & theming                                         ║
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
  document.body.classList.remove("light","mid","dark");
  document.body.classList.add(uiModeSel.value);
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  Biome select – description + save to Firestore                     ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
biomeSelect.addEventListener("change", () => {
  biomeDesc.textContent = biomeDescriptions[biomeSelect.value] ?? "";
});

confirmBiome.addEventListener("click", async () => {
  const biome = biomeSelect.value;
  if (!biome) return alert("Please choose a biome first.");

  const user = auth.currentUser;
  if (!user)  return alert("You need to be logged in.");

  try {
    await db.doc(`users/${user.uid}`).set(
      { biome, clan: generateClan() },
      { merge: true }
    );
    document.body.setAttribute("data-biome", biome);

    chooseScreen.style.display = "none";
    appRoot.style.display      = "block";
    navigateTo("camp");
  } catch (err) {
    console.error(err);
    alert("Couldn’t save biome – try again.");
  }
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  Modal login / sign-up flows                                        ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
let authMode = "login";          // or "signup"

function setAuthMode(mode) {
  authMode = mode;
  authTitle.textContent  = mode === "login" ? "Log In" : "Sign Up";
  authSubmit.textContent = mode === "login" ? "Log In" : "Create Account";
  authToggle.innerHTML   =
    mode === "login"
      ? `Don’t have an account? <a href="#" id="switchToSignUp">Sign Up</a>`
      : `Already have an account? <a href="#" id="switchToLogin">Log In</a>`;
  authError.textContent  = "";
}
setAuthMode("login");

authSubmit.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const pass  = passInput.value.trim();
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
      // create placeholder user doc
      await db.doc(`users/${cred.user.uid}`).set({ biome: null });
    }
    authModal.style.display = "none";
  } catch (err) {
    authError.textContent = err.message;
  }
});

/* Toggle links inside the modal (delegate to the modal) */
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
   ║  Firebase auth state listener                                       ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
auth.onAuthStateChanged(async user => {
  if (!user) {
    // logged out
    appRoot.style.display      = "none";
    chooseScreen.style.display = "none";
    authModal.style.display    = "flex";
    setAuthMode("login");
    return;
  }

  // logged in – check if biome chosen
  try {
    const snap = await db.doc(`users/${user.uid}`).get();
    const data = snap.data() ?? {};

    if (!data.biome) {
      /* First time: needs biome */
      authModal.style.display    = "none";
      appRoot.style.display      = "none";
      chooseScreen.style.display = "flex";
      biomeSelect.value          = "";
      biomeDesc.textContent      = "";
    } else {
      /* Has biome */
      document.body.setAttribute("data-biome", data.biome);
      chooseScreen.style.display = "none";
      authModal.style.display    = "none";
      appRoot.style.display      = "block";
      navigateTo("camp");
    }
  } catch (err) {
    console.error(err);
    alert("Couldn’t load user data.");
  }
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║  On initial load – default theme                                    ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add(uiModeSel.value);  // default mid
});
