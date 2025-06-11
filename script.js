/* ---------------------------------------------------------
   ClanLife – Main Script
--------------------------------------------------------- */

/* ---------- Biome Backgrounds ---------- */
const biomeImages = {
  coast:   "images/placeholder_coast.jpg",
  forest:  "images/placeholder_forest.jpg",
  mountains:"images/placeholder_mountains.jpg",
  plains:  "images/placeholder_plains.jpg",
  swamp:   "images/placeholder_swamp.jpg",
  tundra:  "images/placeholder_tundra.jpg"
};

/* ---------- UI & Biome update ---------- */
function updateBackground() {
  const biome = document.getElementById("biomeSelect").value;
  const mode  = document.getElementById("uiModeSelect").value;

  /* apply background */
  document.body.style.backgroundImage = `url('${biomeImages[biome] || ""}')`;

  /* mode classes */
  document.body.classList.remove("light","mid","dark");
  document.body.classList.add(mode);

  /* biome overlay classes + data attribute */
  document.body.classList.remove(
    "biome-forest","biome-coast","biome-mountains",
    "biome-plains","biome-swamp","biome-tundra"
  );
  document.body.classList.add("biome-" + biome);
  document.body.setAttribute("data-biome", biome); // optional if you still use data attr
}

/* ---------- Navigation ---------- */
function navigateTo(section) {
  const main = document.getElementById("mainContent");
  const pages = {
    camp:       `<h2>Welcome to ClanLife</h2><p>Create an account or log in…</p>`,
    explore:    `<h2>Explore</h2><p>Search the territory…</p>`,
    inventory:  `<h2>Inventory</h2><p>View your items…</p>`,
    crossroads: `<h2>Crossroads</h2><p>Meet neighboring clans…</p>`
  };
  main.innerHTML = pages[section] || "<h2>Coming soon…</h2>";
}

/* ---------- Firebase Auth Gate ---------- */
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

/* Elements */
const appRoot   = document.getElementById("appRoot");
const modal     = document.getElementById("authModal");
const title     = document.getElementById("authTitle");
const emailIn   = document.getElementById("authEmail");
const passIn    = document.getElementById("authPass");
const submitBtn = document.getElementById("authSubmit");
const errBox    = document.getElementById("authError");

let modeAuth = "login"; // or "signup"

/* Switch between Login / SignUp */
function setModeAuth(m){
  modeAuth = m;
  title.textContent     = m === "login" ? "Log In" : "Sign Up";
  submitBtn.textContent = m === "login" ? "Log In" : "Create Account";
  document.getElementById("authToggle").innerHTML =
    m === "login"
      ? `Don’t have an account? <a href="#" id="switchToSignUp">Sign Up</a>`
      : `Already have an account? <a href="#" id="switchToLogin">Log In</a>`;
}
function showError(msg){ errBox.textContent = msg; }

/* Submit login/signup */
submitBtn.onclick = () => {
  const email = emailIn.value.trim();
  const pass  = passIn.value.trim();
  if(!email || !pass){ showError("Please fill in both fields."); return; }

  const action = modeAuth === "login"
    ? auth.signInWithEmailAndPassword(email, pass)
    : auth.createUserWithEmailAndPassword(email, pass);

  action.then(()=>{ modal.style.display="none"; })
        .catch(e => showError(e.message));
};

/* Toggle links */
modal.addEventListener("click", e=>{
  if(e.target.id==="switchToSignUp"){ e.preventDefault(); setModeAuth("signup"); }
  if(e.target.id==="switchToLogin"){ e.preventDefault(); setModeAuth("login");  }
});

/* Auth state listener */
auth.onAuthStateChanged(user=>{
  if(user){
    modal.style.display = "none";
    appRoot.style.display = "block";
    navigateTo("camp");
    updateBackground();
  }else{
    appRoot.style.display = "none";
    modal.style.display   = "flex";
    setModeAuth("login");
  }
});

/* ---------- Init ---------- */
window.addEventListener("DOMContentLoaded", () => {
  updateBackground();
});
