export const tryRefreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
  
    if (!refreshToken) return false;
  
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${refreshToken}` },
    });
  
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken); // Save new token
      localStorage.setItem("refreshToken", data.refreshToken); // Save new refresh token
      return true;
    }
  
    return false; // Refresh failed
  };
  