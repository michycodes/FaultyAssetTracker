import api from './api';

export async function getPlatformUsers() {
  const response = await api.get<string[]>('/admin/users');
  return response.data ?? [];
}
