import { getAuthToken } from './apiClient';

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  currencyPreference?: string;
  languagePreference?: string;
  avatarUrl?: string;
  role: string;
  isVerified?: boolean;
}

export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  currencyPreference?: string;
  languagePreference?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: AuthUser;
  requires_verification?: boolean;
  email?: string;
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

  if (data.token && data.user) {
    localStorage.setItem('auroka_token', data.token);
    localStorage.setItem('auroka_user', JSON.stringify(data.user));
    window.dispatchEvent(new Event('auroka:profile-updated'));
  }

  return data;
};

export const apiVerifyEmail = async (email: string, code: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Kode verifikasi salah atau telah kadaluarsa.');
  }

  if (data.token && data.user) {
    localStorage.setItem('auroka_token', data.token);
    localStorage.setItem('auroka_user', JSON.stringify(data.user));
    window.dispatchEvent(new Event('auroka:profile-updated'));
  }

  return data;
};

export const apiResendVerification = async (email: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Gagal mengirim ulang kode verifikasi.');
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
    const errorObj = new Error(data.error || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
    (errorObj as unknown as { requires_verification?: boolean; email?: string }).requires_verification = data.requires_verification;
    (errorObj as unknown as { requires_verification?: boolean; email?: string }).email = data.email || email;
    throw errorObj;
  }

  if (data.token && data.user) {
    localStorage.setItem('auroka_token', data.token);
    localStorage.setItem('auroka_user', JSON.stringify(data.user));
    window.dispatchEvent(new Event('auroka:profile-updated'));
  }

  return data;
};

export const apiForgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Gagal memproses permintaan reset kata sandi.');
  }

  return data;
};

export const apiResetPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Gagal mengatur ulang kata sandi.');
  }

  return data;
};

export const apiGetMe = async (): Promise<AuthUser> => {
  const token = getAuthToken();
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
    window.dispatchEvent(new Event('auroka:profile-updated'));
  }
};

export const apiUpdateProfile = async (data: UpdateProfileDTO): Promise<{ message: string; user: AuthUser }> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan login kembali.');
  }

  const response = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.error || 'Gagal memperbarui profil.');
  }

  if (resData.user && typeof window !== 'undefined') {
    const existing = localStorage.getItem('auroka_user');
    const existingUser = existing ? JSON.parse(existing) : {};
    const mergedUser = { ...existingUser, ...resData.user };
    localStorage.setItem('auroka_user', JSON.stringify(mergedUser));
    window.dispatchEvent(new Event('auroka:profile-updated'));
  }

  return resData;
};

export const apiUpdatePassword = async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan login kembali.');
  }

  const response = await fetch(`${API_BASE}/auth/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      oldPassword,
      currentPassword: oldPassword,
      newPassword,
    }),
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.error || 'Gagal memperbarui kata sandi.');
  }

  return resData;
};
