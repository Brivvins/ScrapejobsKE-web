import { fetchJson } from './client';
import type { AuthResponse, LoginRequest } from '../types/auth';

export async function login(
  apiBase: string,
  request: LoginRequest
): Promise<AuthResponse> {
  return fetchJson<AuthResponse>(`${apiBase}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
