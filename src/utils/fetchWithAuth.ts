/**
 * Global fetch wrapper that handles 401 (unauthorized) responses
 * and clears user authentication state
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Store reference to auth context setUser function
let authContextSetUser: ((user: any) => void) | null = null;
let authContextSetLocation: ((path: string) => void) | null = null;

export function setAuthContextHandlers(
  setUser: (user: any) => void,
  setLocation: (path: string) => void
) {
  authContextSetUser = setUser;
  authContextSetLocation = setLocation;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    credentials: "include",
  });

  // If we get a 401, clear user state and redirect to login
  if (response.status === 401 && authContextSetUser) {
    console.warn("[Auth] 401 Unauthorized - clearing user session");
    authContextSetUser(null);
    
    // Only redirect if not already on a login page
    if (authContextSetLocation && !window.location.pathname.includes('/login')) {
      authContextSetLocation('/login/customer');
    }
  }

  return response;
}
