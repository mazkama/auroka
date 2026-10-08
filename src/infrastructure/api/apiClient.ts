const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // In browser, use relative path if same domain or NEXT_PUBLIC_API_URL
    return process.env.NEXT_PUBLIC_API_URL || '/api/v1';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
};

/**
 * Retrieves the active JWT token.
 * If token is present in URL search params (e.g. from Google OAuth callback redirect),
 * it stores it into localStorage and immediately cleans the URL parameter.
 * NOTE: This function MUST remain pure and NOT dispatch events to avoid recursive event loops.
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  // 1. If URL has token from OAuth callback, prioritize it, store it, and clean the URL immediately
  if (window.location.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        localStorage.setItem('auroka_token', urlToken);
        const cleanUrl = window.location.pathname + (window.location.hash || '');
        window.history.replaceState({}, document.title, cleanUrl);
        return urlToken;
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  // 2. Otherwise read from localStorage
  return localStorage.getItem('auroka_token');
};

export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const baseUrl = getBaseUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      const isAuthRoute =
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register') ||
        window.location.pathname.startsWith('/forgot-password') ||
        window.location.pathname === '/';

      // Only clear and redirect if we are on protected internal pages
      if (!isAuthRoute) {
        localStorage.removeItem('auroka_token');
        localStorage.removeItem('auroka_user');
        window.location.href = '/login';
      }
    }

    throw new Error(data.error || `HTTP Error ${response.status}: ${response.statusText}`);
  }

  return data.data !== undefined ? data.data : data;
};
