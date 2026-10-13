import { API_BASE_URL } from "../../config/api";

function callAPI({ url, method, body, loadingState, dataState, headers, need_admin_token }) {

  // Local vs production is decided in src/config/api.js.
  let baseURL = API_BASE_URL

  let methodWithBody = {}
  methodWithBody["method"] = method
  if (body != undefined) {
    methodWithBody["body"] = JSON.stringify(body)
  }
  let token = localStorage.getItem("token")

  if (need_admin_token) {
    if (localStorage.getItem("agency-token")) {
      token = localStorage.getItem("agency-token")
    }
  }

  methodWithBody["headers"] = headers || {}
  methodWithBody["headers"]["Authorization"] = token || localStorage.getItem("token")
  loadingState(true)

  fetch(`${baseURL}/${url}`, methodWithBody)
    .then(response => response.json())
    .then(data => {
      if (data.code == "401" && data.message != "Invalid credentials") {
        if (url != "/list-agency-account") {
          window.location.href = "/login";
        }
      }

      // Handle workspace access revoked (member removed)
      if (data.code === 403 || data.code === "403" || data.message === "WORKSPACE_ACCESS_DENIED" || data.code === "WORKSPACE_ACCESS_DENIED") {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const publicPaths = ["/team-invite", "/login", "/signup", "/workspace-picker", "/reset-password"];
        const isPublicPage = publicPaths.some(p => window.location.pathname.startsWith(p));
        if (userData.workspace_id && !isPublicPage) {
          localStorage.removeItem("current_workspace_id");
          const personalToken = localStorage.getItem("personal_token");
          if (personalToken) {
            localStorage.setItem("token", personalToken);
            localStorage.removeItem("personal_token");
          }
          delete userData.workspace_id;
          delete userData.workspace_role;
          localStorage.setItem("userData", JSON.stringify(userData));
          window.location.href = "/login";
          return;
        }
      }

      // Backend healed a stale-email token (the account's email changed after
      // this token was minted — other tab/device, or a cached switcher token).
      // Swap in the fresh token so later calls stop carrying the dead claim.
      try {
        const freshToken = data?.refreshed_token || data?.data?.refreshed_token;
        if (freshToken && token === localStorage.getItem("token")) {
          localStorage.setItem("token", freshToken);
          const payload = JSON.parse(atob(freshToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
          const cached = JSON.parse(localStorage.getItem("connected_accounts") || "null");
          if (payload?.user_id && cached?.accounts?.length) {
            cached.accounts = cached.accounts.map(acc =>
              acc?.user_id === payload.user_id ? { ...acc, token: freshToken } : acc
            );
            localStorage.setItem("connected_accounts", JSON.stringify(cached));
          }
        }
      } catch (e) {
        console.error("refreshed_token handling failed:", e);
      }

      dataState(data)
      loadingState(false)
    })
    .catch(err => {
      console.error("API call failed:", url, err);
      loadingState(false)
      dataState({ code: "500", message: "Network error", error: err?.message || "Request failed" })
    })
}

export default callAPI;
