// database.js - LocalStorage-based data persistence (Replacing Firebase)

export async function saveUserData(userId, data) {
  localStorage.setItem('clanlife_user_data_' + userId, JSON.stringify(data));
}

export async function loadUserData(userId) {
  const data = localStorage.getItem('clanlife_user_data_' + userId);
  return data ? JSON.parse(data) : null;
}

export async function updateUserData(userId, newData) {
  const current = await loadUserData(userId) || {};
  const updated = { ...current, ...newData };
  await saveUserData(userId, updated);
}
