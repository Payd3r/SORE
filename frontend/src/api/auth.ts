import { API_URLS } from './config';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface JoinCoupleData extends RegisterData {
  coupleId: string;
}

export interface CreateCoupleData extends RegisterData {
  coupleName: string;
  anniversaryDate: string;
}

export interface UpdateUserData {
  name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    profile_picture_url?: string | null;
    theme_preference: 'light' | 'dark' | 'system';
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token di autenticazione non trovato');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(API_URLS.auth.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Errore durante il login');
  }

  return response.json();
};

export const registerWithCouple = async (data: JoinCoupleData): Promise<AuthResponse> => {
  const response = await fetch(API_URLS.auth.registerJoin, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Errore durante la registrazione');
  }

  return response.json();
};

export const registerNewCouple = async (data: CreateCoupleData): Promise<AuthResponse> => {
  const response = await fetch(API_URLS.auth.registerNew, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Errore durante la registrazione');
  }

  return response.json();
};

export const updateUser = async (data: UpdateUserData): Promise<ApiResponse<AuthResponse['user']>> => {
  const response = await fetch(`${API_URLS.base}/auth/user`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Errore durante l\'aggiornamento del profilo');
  }

  return response.json();
};

export const deleteUser = async (password: string): Promise<ApiResponse<null>> => {
  const response = await fetch(`${API_URLS.base}/auth/user`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Errore durante l\'eliminazione dell\'account');
  }

  return response.json();
}; 