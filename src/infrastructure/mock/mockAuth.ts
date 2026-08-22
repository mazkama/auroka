export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

export const MOCK_USER: UserProfile = {
  id: 'usr-auroka-001',
  name: 'Demo Auroka User',
  email: 'user@auroka.id',
  role: 'PRO_MEMBER',
};

export const mockLogin = async (email: string, pass: string): Promise<UserProfile> => {
  await new Promise((res) => setTimeout(res, 300));
  if (!email || !pass) {
    throw new Error('Email dan password wajib diisi');
  }
  return {
    id: `usr-${Date.now()}`,
    name: email.split('@')[0].toUpperCase(),
    email: email,
    role: 'PRO_MEMBER',
  };
};

export const mockRegister = async (name: string, email: string, pass: string): Promise<UserProfile> => {
  await new Promise((res) => setTimeout(res, 300));
  if (!name || !email || !pass) {
    throw new Error('Semua field pendaftaran wajib diisi');
  }
  return {
    id: `usr-${Date.now()}`,
    name: name,
    email: email,
    role: 'PRO_MEMBER',
  };
};
