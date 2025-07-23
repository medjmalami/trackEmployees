import { tryRefreshToken } from "./tryRefreshToken";

export const authFetch = async (url: string, options: RequestInit = {}) => {
  // Get access token from localStorage
  const accessToken = localStorage.getItem("accessToken");
  
  if (!accessToken) {
    // No access token, redirect to login
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    return;
  }

  // Prepare headers - merge with existing headers if any
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`, // Always use access token
  };

  // First try the request with access token
  let res = await fetch(url, {
    ...options,
    headers,
  });

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
          // Get the NEW access token after refresh
          const newAccessToken = localStorage.getItem("accessToken");
          // Try the same request again with new token
          res = await fetch(url, {
            ...options,
            headers: {
              ...headers,
              'Authorization': `Bearer ${newAccessToken}`,
            },
          });
        } else {
          // Refresh failed
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return;
        }
      }
    } catch (error) {
      // Response is not JSON, just return the original response
      return res;
    }
  } else if (res.status === 401) {
    // Handle actual HTTP 401 status
    const didRefresh = await tryRefreshToken();
    if (didRefresh) {
      // Get the NEW access token after refresh
      const newAccessToken = localStorage.getItem("accessToken");
      res = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          'Authorization': `Bearer ${newAccessToken}`,
        },
      });
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return;
    }
  }

  return res;
};