// Js/script.js - Updated to support local storage and avoid conflicts

import { listenForAuth } from "../auth.js";
import { loadUserData } from "../database.js";

listenForAuth(async (user) => {
  if (user) {
    console.log("User logged in:", user);
    let data = await loadUserData(user.uid);
    if (data && window.gameState) {
      Object.assign(window.gameState, data);
      window.gameState.user = user.email;
      if (window.updateTopbar) window.updateTopbar();
    }
  }
});

// Expose functions to window for compatibility
// These are already defined in index.html, so we don't need to override them here
// unless we want to add extra logic. For now, we'll let index.html handle the UI.

window.testGenerate = function() {
  // Use the global genCat if available, otherwise use a fallback
  const generator = typeof genCat === 'function' ? genCat : () => ({
    id: 'cat_' + Date.now(),
    name: 'Test Cat',
    role: 'Warrior',
    art: '🐱',
    stats: { health: 100, attack: 50, speed: 50, stamina: 50, wisdom: 50 },
    alive: true
  });

  const cat = generator();
  if (window.gameState) {
    window.gameState.cats.push(cat);
    if (window.renderClan) window.renderClan();
    if (window.toast) window.toast('New cat generated: ' + cat.name, 'success');
  }
};
