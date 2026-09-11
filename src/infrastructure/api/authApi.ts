export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const apiRegister = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Gagal mendaftarkan akun. Silakan coba lagi.');
  }

  if (data.token) {
    localStorage.setItem('auroka_token', data.token);
    localStorage.setItem('auroka_user', JSON.stringify(data.user));
  }

  return data;
};

export const apiLogin = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
  }

  if (data.token) {
    localStorage.setItem('auroka_token', data.token);
    localStorage.setItem('auroka_user', JSON.stringify(data.user));
  }

  return data;
};

export const apiGetMe = async (): Promise<AuthUser> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auroka_token') : null;
  if (!token) {
    throw new Error('Token tidak ditemukan.');
  }

  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Sesi telah berakhir.');
  }

  return data.user;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auroka_token');
    localStorage.removeItem('auroka_user');
  }
};
