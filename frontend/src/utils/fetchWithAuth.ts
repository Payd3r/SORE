/**
 * Wrapper per fetch che gestisce automaticamente il logout e il redirect se il token è scaduto (403)
 * @param input URL o Request
 * @param init Opzioni fetch
 * @returns Response o lancia errore
 */
export async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers = {
    ...(init?.headers || {}),
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };

  const response = await fetch(input, { ...init, headers });

  if (response.status === 403) {
    // Logout globale e redirect
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('darkMode');
    localStorage.removeItem('lastVisit');
    window.location.href = '/welcome';
    throw new Error('Sessione scaduta. Effettua nuovamente il login.');
  }

  return response;
} 