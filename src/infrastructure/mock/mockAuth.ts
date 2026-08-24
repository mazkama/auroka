export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

export interface MockUserRecord extends UserProfile {
  passwordHash: string;
}

export const INITIAL_MOCK_USERS: MockUserRecord[] = [
  {
    id: 'usr-auroka-001',
    name: 'Demo Auroka User',
    email: 'user@auroka.id',
    passwordHash: 'password123',
    role: 'PRO_MEMBER',
  },
  {
    id: 'usr-auroka-002',
    name: 'Alan Mazkama',
    email: 'alan@auroka.id',
    passwordHash: 'password123',
    role: 'PRO_MEMBER',
  },
];

const mockUsersMemory: MockUserRecord[] = [...INITIAL_MOCK_USERS];

export const MOCK_USER: UserProfile = {
  id: INITIAL_MOCK_USERS[0].id,
  name: INITIAL_MOCK_USERS[0].name,
  email: INITIAL_MOCK_USERS[0].email,
  role: INITIAL_MOCK_USERS[0].role,
};

export const mockLogin = async (email: string, pass: string): Promise<UserProfile> => {
  await new Promise((res) => setTimeout(res, 300));

  if (!email || !pass) {
    throw new Error('Email dan kata sandi wajib diisi.');
  }

  const foundUser = mockUsersMemory.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!foundUser || foundUser.passwordHash !== pass) {
    throw new Error('Email atau password salah. Gunakan akun demo: user@auroka.id / password123');
  }

  return {
    id: foundUser.id,
    name: foundUser.name,
    email: foundUser.email,
    avatarUrl: foundUser.avatarUrl,
    role: foundUser.role,
  };
};

export const mockRegister = async (name: string, email: string, pass: string): Promise<UserProfile> => {
  await new Promise((res) => setTimeout(res, 300));

  if (!name || !email || !pass) {
    throw new Error('Semua bidang pendaftaran wajib diisi.');
  }

  const existing = mockUsersMemory.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (existing) {
    throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau masuk di halaman login.');
  }

  const newUser: MockUserRecord = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: pass,
    role: 'PRO_MEMBER',
  };

  mockUsersMemory.push(newUser);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
};
