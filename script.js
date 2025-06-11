// Biome → background URLs
const biomeImages = {
  coast:   "images/placeholder_coast.jpg",
  forest:  "images/placeholder_forest.jpg",
  mountains:"images/placeholder_mountains.jpg",
  plains:  "images/placeholder_plains.jpg",
  swamp:   "images/placeholder_swamp.jpg",
  tundra:  "images/placeholder_tundra.jpg"
};

// Update background & mode
function updateBackground() {
  const biome = document.getElementById("biomeSelect").value;
  const mode  = document.getElementById("uiModeSelect").value;

  document.body.style.backgroundImage = `url('${biomeImages[biome] || ""}')`;
  document.body.classList.remove("light", "mid", "dark");
  document.body.classList.add(mode);          // adds 'light', 'mid', or 'dark'
}

// Tab navigation
function navigateTo(section) {
  const main = document.getElementById("mainContent");
  const pages = {
    camp:       `<h2>Welcome to ClanLife</h2><p>Create an account or log in…</p><button id="loginBtn">Log In</button><button id="signupBtn">Sign Up</button>`,
    explore:    `<h2>Explore</h2><p>Search the territory…</p>`,
    inventory:  `<h2>Inventory</h2><p>View your items…</p>`,
    crossroads: `<h2>Crossroads</h2><p>Meet neighboring clans…</p>`
  };
  main.innerHTML = pages[section] || "<h2>Coming soon…</h2>";
  // Re-attach auth buttons each time Camp page is rendered
  if (section === "camp") attachAuthHandlers();
}

/* ---------- existing biome + navigation code ABOVE remains unchanged ---------- */

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
const toggleTxt = document.getElementById("authToggle");
const switchLink= document.getElementById("switchToSignUp");
const errBox    = document.getElementById("authError");

let mode = "login"; // or "signup"

/* Swap modal between Log In and Sign Up */
function setMode(m){
  mode = m;
  title.textContent = m === "login" ? "Log In" : "Sign Up";
  submitBtn.textContent = m === "login" ? "Log In" : "Create Account";
  toggleTxt.innerHTML =
    m === "login"
      ? `Don’t have an account? <a href="#" id="switchToSignUp">Sign Up</a>`
      : `Already have an account? <a href="#" id="switchToLogin">Log In</a>`;
}
function showError(msg){ errBox.textContent = msg; }

/* Submit handler */
submitBtn.onclick = () => {
  const email = emailIn.value.trim();
  const pass  = passIn.value.trim();
  if(!email || !pass){ showError("Please fill in both fields."); return; }

  const action = mode === "login"
    ? auth.signInWithEmailAndPassword(email, pass)
    : auth.createUserWithEmailAndPassword(email, pass);

  action.then(()=>{ modal.style.display="none"; })
        .catch(e => showError(e.message));
};

/* Link switching */
modal.addEventListener("click", e=>{
  if(e.target.id==="switchToSignUp"){ e.preventDefault(); setMode("signup"); }
  if(e.target.id==="switchToLogin"){ e.preventDefault(); setMode("login");  }
});

/* Firebase auth state */
auth.onAuthStateChanged(user=>{
  if(user){
    modal.style.display = "none";
    appRoot.style.display = "block";
    navigateTo("camp");
  }else{
    appRoot.style.display = "none";
    modal.style.display   = "flex";
    setMode("login");
  }
});

/* Load biome/mode defaults once user is in */
window.addEventListener("DOMContentLoaded", ()=>{
  updateBackground();
});
