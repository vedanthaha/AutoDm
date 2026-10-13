// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";
import { jwtDecode } from "jwt-decode";
import getActiveUserId from "./getActiveUserId";
import { API_BASE_URL } from "../config/api";


const firebaseConfig = {
  apiKey: "AIzaSyArcQPoHMgI5Eo8ga-ZFYd82cku3gsirhM",
  authDomain: "instantdm-a8b09.firebaseapp.com",
  projectId: "instantdm-a8b09",
  storageBucket: "instantdm-a8b09.firebasestorage.app",
  messagingSenderId: "796338025326",
  appId: "1:796338025326:web:fbf1b188cf7d0ecafcc77f",
  measurementId: "G-JTED4VNJFV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireANALYTICS = getAnalytics(app);
const fireAUTH = getAuth(app);
const fireDB = getFirestore(app);
const fireSTORAGE = getStorage(app);

const apiBase = () => API_BASE_URL;

// Native apps (Flutter / RN) do not use this file. Still skip any
// embedded WebView shell so only the website exchanges the JWT.
export function isWebClient() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (typeof navigator === "undefined") return false;
  if (navigator.product === "ReactNative") return false;
  if (window.ReactNativeWebView) return false;
  return true;
}

let inflight = null;

// Prefer workspace/user from userData; fall back to the JWT already in
// localStorage so a returning session does not need another InstantDM login.
function expectedUid() {
  const fromStore = getActiveUserId();
  if (fromStore) return fromStore;
  const jwt = localStorage.getItem("token");
  if (!jwt) return null;
  try {
    const payload = jwtDecode(jwt);
    return payload.workspace_id || payload.user_id || null;
  } catch (e) {
    return null;
  }
}

export async function ensureFirebaseAuth() {
  // Paused: fix RN app sign-in first, then turn this back on for web.
  return null;

  if (!isWebClient()) return null;

  const jwt = localStorage.getItem("token");

  try {
    await fireAUTH.authStateReady();
  } catch (e) { /* ignore */ }

  if (!jwt) {
    if (fireAUTH.currentUser) {
      try { await signOut(fireAUTH); } catch (e) { /* ignore */ }
    }
    return null;
  }

  const uid = expectedUid();
  if (uid && fireAUTH.currentUser?.uid === uid) {
    return fireAUTH.currentUser;
  }

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch(`${apiBase()}/firebase-token`, {
        method: "GET",
        headers: { Authorization: jwt },
      });
      const data = await res.json().catch(() => ({}));
      if (!data?.custom_token) {
        console.warn("Firebase custom token unavailable", data?.message || res.status);
        return fireAUTH.currentUser || null;
      }
      const cred = await signInWithCustomToken(fireAUTH, data.custom_token);
      return cred.user;
    } catch (err) {
      console.warn("Firebase sign-in failed", err);
      return fireAUTH.currentUser || null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

// Returning users already have an InstantDM JWT — exchange it on load.
// Paused until the RN app signs in the same way.
// if (isWebClient() && localStorage.getItem("token")) {
//   ensureFirebaseAuth();
// }

export { fireANALYTICS, fireAUTH, fireDB, fireSTORAGE };
