// auth.js - LocalStorage-based Authentication (Replacing Firebase)

let currentUser = JSON.parse(localStorage.getItem('clanlife_current_user')) || null;
let authListeners = [];

export async function signUp(email, password) {
  const users = JSON.parse(localStorage.getItem('clanlife_registered_users') || '{}');
  if (users[email]) throw new Error("User already exists");
  
  users[email] = { password: btoa(password), uid: 'user_' + Date.now() };
  localStorage.setItem('clanlife_registered_users', JSON.stringify(users));
  
  return await login(email, password);
}

export async function login(email, password) {
  const users = JSON.parse(localStorage.getItem('clanlife_registered_users') || '{}');
  const user = users[email];
  
  if (!user || user.password !== btoa(password)) {
    throw new Error("Invalid email or password");
  }
  
  currentUser = { email, uid: user.uid };
  localStorage.setItem('clanlife_current_user', JSON.stringify(currentUser));
  notifyListeners();
  return currentUser;
}

export async function logout() {
  currentUser = null;
  localStorage.removeItem('clanlife_current_user');
  notifyListeners();
}

export function listenForAuth(callback) {
  authListeners.push(callback);
  callback(currentUser);
}

function notifyListeners() {
  authListeners.forEach(callback => callback(currentUser));
}
