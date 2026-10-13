// Central API configuration — every API call in the app uses API_BASE_URL.
//
// Default: on localhost the app talks to the local backend, everywhere else
// it talks to production.
//
// To use the production API while running locally, comment out the LOCAL line
// below and uncomment the PRODUCTION line. REACT_APP_API_URL, if set, still
// overrides both.

const PROD_API_URL = "https://api.instantdm.com";
const LOCAL_API_URL = "http://localhost:5000";

const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

// LOCAL: localhost -> local backend, otherwise production
const DEFAULT_API_URL = isLocalhost ? LOCAL_API_URL : PROD_API_URL;
// PRODUCTION: always use production, even on localhost
// const DEFAULT_API_URL = PROD_API_URL;

export const API_BASE_URL = (
  process.env.REACT_APP_API_URL || DEFAULT_API_URL
).replace(/\/+$/, ""); // strip any trailing slash for consistent joining

export default API_BASE_URL;
