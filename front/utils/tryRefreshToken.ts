export const tryRefreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/refresh`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${refreshToken}` 
      },
    });

    if (res.ok) {
      const data = await res.json();
      
      // Now using camelCase property names from fixed refresh controller
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      
      return true;
    }
  } catch (error) {
    return false;
  }
  
  return false;
};