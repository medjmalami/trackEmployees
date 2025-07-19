import { tryRefreshToken } from "./tryRefreshToken";
export const authFetch = async (url : string, options = {}) => {
    // First try the request
    let res = await fetch(url, options);
  
    if (res.status === 401) {
      // If it failed with 401 (token expired)
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
  
    return res; // success
  };
  