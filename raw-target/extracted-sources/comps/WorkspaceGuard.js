import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import callAPI from "./fetch/main";

// Routes that don't need workspace access checks
const PUBLIC_ROUTES = [
  "/login", "/signup", "/reset-password", "/ig-connect",
  "/fb-rdr", "/fb-api-rdr", "/ig_auth_app",
  "/team-invite", "/workspace-picker", "/c/", "/connect/",
  "/shared-flow", "/dp/", "/p/", "/u/", "/stripe-success", "/stripe-failure",
  "/collab-order-success", "/collab-order-cancel",
  "/connect-shopify-store", "/shopfy-rdr", "/shopfy-login"
];

function WorkspaceGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const checking = useRef(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    // Only check if user is in workspace mode (has _member context via workspace_id)
    if (!userData.workspace_id) return;

    // Skip public routes — don't interfere with invite acceptance etc.
    const path = location.pathname;
    if (PUBLIC_ROUTES.some(r => path.startsWith(r))) return;

    // Avoid duplicate checks for the same path
    if (checking.current) return;
    checking.current = true;

    // Ping a lightweight team endpoint to verify access
    callAPI({
      url: `team/members?workspace_id=${userData.workspace_id}`,
      method: "GET",
      loadingState: () => {},
      dataState: (data) => {
        checking.current = false;
        if (
          data.code === 403 || data.code === "403" ||
          data.message === "WORKSPACE_ACCESS_DENIED" ||
          data.code === "WORKSPACE_ACCESS_DENIED"
        ) {
          // Clear workspace session
          localStorage.removeItem("current_workspace_id");
          const personalToken = localStorage.getItem("personal_token");
          if (personalToken) {
            localStorage.setItem("token", personalToken);
            localStorage.removeItem("personal_token");
          }
          delete userData.workspace_id;
          delete userData.workspace_role;
          localStorage.setItem("userData", JSON.stringify(userData));
          navigate("/login", { replace: true });
        }
      }
    });
  }, [location.pathname]);

  return children;
}

export default WorkspaceGuard;
