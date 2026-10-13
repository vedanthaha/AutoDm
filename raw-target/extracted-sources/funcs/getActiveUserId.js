/**
 * Returns the user_id to use for data access (Firestore, etc.)
 * @param {boolean} personal - if true, always returns the member's own user_id
 * By default returns workspace_id (owner's user_id) when in workspace mode
 */
function getActiveUserId(personal = false) {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  if (personal) return userData?.user_id;
  return userData?.workspace_id || userData?.user_id;
}

export default getActiveUserId;
