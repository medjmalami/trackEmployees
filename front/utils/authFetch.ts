import { tryRefreshToken } from "./tryRefreshToken";

export const authFetch = async (url: string, options = {}) => {
  // First try the request
  let res = await fetch(url, options);
  
  // Check if response is ok (status 200-299)
  if (res.ok) {
    // Clone the response so we can read it twice if needed
    const resClone = res.clone();
    try {
      const data = await resClone.json();
      
      // Check if the response body contains a 401 status code
      if (data.statusCode === 401) {
        // Token expired, try to refresh
        const didRefresh = await tryRefreshToken();
        if (didRefresh) {
          // Try the same request again after refreshing the token
          res = await fetch(url, options);
        } else {
          // Refresh failed (maybe refresh token is also expired)
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login"; // logout
          return;
        }
      }
    } catch (error) {
      // Response is not JSON, just return the original response
      return res;
    }
  } else if (res.status === 401) {
    // Handle actual HTTP 401 status (in case your API sometimes uses this)
    const didRefresh = await tryRefreshToken();
    if (didRefresh) {
      res = await fetch(url, options);
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return;
    }
  }
  
  return res; // success or other error
};