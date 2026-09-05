import { create } from 'zustand'
import { ApiError, apiFetch, REMOTE_AUTH_ENABLED } from '../../../shared/data/apiClient'
import { activateLocalRepository, activateRemoteRepository } from '../../../shared/data/repository'
import { migrateLocalLayoutsToRemote } from '../../../shared/data/migration'

export interface AuthUser { id: string; email: string; mustChangePassword: boolean }
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
interface AuthState { status: AuthStatus; user: AuthUser | null; remoteEnabled: boolean; error: string | null; bootstrap: () => Promise<void>; signup: (email: string) => Promise<void>; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; changePassword: (currentPassword: string, newPassword: string) => Promise<void>; forgotPassword: (email: string) => Promise<void>; resetPassword: (token: string, newPassword: string) => Promise<void>; clearError: () => void }

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof TypeError) return 'Não foi possível conectar ao servidor. Verifique sua conexão.'
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

async function activateUser(user: AuthUser): Promise<void> {
  activateRemoteRepository(user.id)
  try { await migrateLocalLayoutsToRemote(user.id) } catch { /* remote account remains usable; local data is retained */ }
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading', user: null, remoteEnabled: REMOTE_AUTH_ENABLED, error: null,
  async bootstrap() {
    if (!REMOTE_AUTH_ENABLED) { activateLocalRepository(); set({ status: 'unauthenticated', user: null }); return }
    try { const { user } = await apiFetch<{ user: AuthUser }>('/api/auth/me'); await activateUser(user); set({ status: 'authenticated', user, error: null }) }
    catch { activateLocalRepository(); set({ status: 'unauthenticated', user: null }) }
  },
  async signup(email) { set({ error: null }); try { await apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email }) }) } catch (err) { set({ error: messageFor(err) }); throw err } },
  async login(email, password) {
    set({ error: null })
    try { const { user } = await apiFetch<{ user: AuthUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); await activateUser(user); set({ status: 'authenticated', user, error: null }) }
    catch (err) { set({ error: messageFor(err) }); throw err }
  },
  async logout() { if (REMOTE_AUTH_ENABLED) { try { await apiFetch('/api/auth/logout', { method: 'POST' }) } catch { /* best effort */ } } activateLocalRepository(); set({ status: 'unauthenticated', user: null, error: null }) },
  async changePassword(currentPassword, newPassword) { set({ error: null }); try { const { user } = await apiFetch<{ user: AuthUser }>('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }); set({ user, error: null }) } catch (err) { set({ error: messageFor(err) }); throw err } },
  async forgotPassword(email) { set({ error: null }); try { await apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }) } catch (err) { set({ error: messageFor(err) }); throw err } },
  async resetPassword(token, newPassword) { set({ error: null }); try { await apiFetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }) } catch (err) { set({ error: messageFor(err) }); throw err } },
  clearError: () => set({ error: null }),
}))
