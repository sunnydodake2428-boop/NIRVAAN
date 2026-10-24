// One place for login state, so every screen behaves the same way.
const ROLE_HOME = { caller: "/patient", driver: "/driver", admin: "/admin" };

function tokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return !!payload.exp && payload.exp * 1000 < Date.now();
  } catch (err) {
    return true;
  }
}

export function getSession() {
  return {
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
  };
}

// True only when there is a token that has not expired and a known role.
export function isLoggedIn() {
  const { token, role } = getSession();
  return !!token && !!ROLE_HOME[role] && !tokenExpired(token);
}

export function homeForRole(role) {
  return ROLE_HOME[role] || "/login";
}

export function clearSession() {
  ["token", "role", "activeTripId"].forEach((k) => localStorage.removeItem(k));
}

// Use this for EVERY logout button (admin, driver, patient).
// A full reload also wipes in-memory state such as the active-trip context.
export function logout() {
  clearSession();
  window.location.replace("/login");
}