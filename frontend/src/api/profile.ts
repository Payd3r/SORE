import { API_URLS } from './config';
import { ApiResponse, UserInfo, CoupleInfo } from './types';
import { getAuthHeaders } from './auth';
import { AuthResponse } from './auth';
import { resizeAndConvertToBase64 } from './imageUtils';

export const getUserInfo = async (userId: number): Promise<UserInfo> => {
  const response = await fetch(`${API_URLS.base}/api/users/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }
  const data: ApiResponse<UserInfo> = await response.json();
  return data.data;
};

export const getCoupleInfo = async (coupleId: number): Promise<CoupleInfo> => {
  try {
    const response = await fetch(`${API_URLS.base}/api/couples/${coupleId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Non hai i permessi per accedere a queste informazioni');
      }
      throw new Error('Failed to fetch couple info');
    }
    const data: ApiResponse<CoupleInfo> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error in getCoupleInfo:', error);
    throw error;
  }
};

export const updateUserInfo = async (data: Partial<UserInfo>): Promise<UserInfo> => {
  try {
    const response = await fetch(`${API_URLS.base}/api/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Errore durante l\'aggiornamento dei dati');
    }

    const responseData: ApiResponse<UserInfo> = await response.json();
    return responseData.data;
  } catch (error) {
    throw error;
  }
};

export const uploadProfilePicture = async (file: File): Promise<AuthResponse['user']> => {
  try {
    // Ridimensiona e converti l'immagine in base64
    const base64Image = await resizeAndConvertToBase64(file, 300, 300);
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URLS.base}/api/users/profile-picture`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        profile_picture: base64Image
      })
    });
    const data: ApiResponse<UserInfo> = await response.json();
    return {
      id: data.data.id.toString(),
      name: data.data.name,
      email: data.data.email,
      profile_picture_url: data.data.profile_picture_url
    };
  } catch (error) {
    throw error;
  }
};

export const updatePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${API_URLS.base}/api/users/edit-password`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword
    })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Errore durante il cambio password');
  }

  const data: ApiResponse<void> = await response.json();
  return data.data;
}; 