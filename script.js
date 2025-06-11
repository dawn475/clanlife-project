// --- Firebase initialization ---
// Replace these config values with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // add other config fields if needed
};
firebase.initializeApp(firebaseConfig);

// --- Biome descriptions ---
const biomeDescriptions = {
  forest:    "Dense trees and filtered sunlight. A traditional and balanced home.",
  coast:     "Salty breezes and shifting sands. Ideal for agile and curious cats.",
  mountains: "Rocky heights and thin air. Suits the tough and resilient.",
  plains:    "Open skies and golden grasses. Great for swift, observant cats.",
  swamp:     "Misty marshes full of secrets. Favored by stealthy and clever cats.",
  tundra:    "Harsh cold and endless white. Only the most resourceful survive here."
};

// --- Generate placeholder clan ---
function generateClan() {
  const names = [
    "Ash", "Breeze", "Cinder", "Dusk", "Ember", "Fern", "Gale", "Hollow", "Ivy", "Jade",
    "Kite", "Lark", "Moss", "Night", "Opal", "Pine", "Quartz", "Raven", "Sage", "Thistle"
  ];
  const suffixes = [
    "fur", "claw", "tail", "whisker", "pelt", "step", "fang", "shade", "leap", "gaze"
  ];
  let clan = [];
  for (let i = 0; i < 10; i++) {
    const name = names[Math.floor(Math.random() * names.length)] +
                 suffixes[Math.floor(Math.random() * suffixes.length)];
    clan.push({ name });
  }
  return clan;
}

// --- DOM references ---
const biomeSelect = document.getElementById("biomeSelect");
const biomeDesc = document.getElementById("biomeDescription");
const confirmBtn = document.getElementById("confirmBiome");
const chooseBiomeScreen = document.getElementById("chooseBiomeScreen");
const appRoot = document.getElementById("appRoot");

// --- Update description on biome select change ---
biomeSelect.addEventListener("change", () => {
  const val = biomeSelect.value;
  biomeDesc.textContent = biomeDescriptions[val] || "";
});

// --- Confirm biome and generate clan ---
confirmBtn.addEventListener("click", async () => {
  const chosenBiome = biomeSelect.value;
  if (!chosenBiome) {
    alert("Please choose a biome.");
    return;
  }

  const user = firebase.auth().currentUser;
  if (!user) {
    alert("You must be logged in to confirm your biome.");
    return;
  }

  const db = firebase.firestore();
  try {
    await db.collection("users").doc(user.uid).set({
      biome: chosenBiome,
      clan: generateClan()
    }, { merge: true });

    // Update UI
    document.body.setAttribute("data-biome", chosenBiome);
    chooseBiomeScreen.style.display = "none";
    appRoot.style.display = "block";

    // Navigate to camp screen if function exists
    if (typeof navigateTo === "function") {
      navigateTo("camp");
    } else {
      console.warn("navigateTo function is not defined.");
    }
  } catch (error) {
    console.error("Error saving biome and clan:", error);
    alert("An error occurred while saving your biome. Please try again.");
  }
});
