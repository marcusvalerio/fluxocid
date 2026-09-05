import { create } from 'zustand'
import { ApiError, apiFetch } from '../../../shared/data/apiClient'
import { activateLocalRepository, activateRemoteRepository } from '../../../shared/data/repository'

export interface AuthUser {
  id: string
  email: string
  mustChangePassword: boolean
}

/** 'loading' only while the initial session check (bootstrap) is in flight — every other state
 * change resolves to 'authenticated' or 'unauthenticated' synchronously with the store update. */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  error: string | null
  bootstrap: () => Promise<void>
  signup: (email: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  clearError: () => void
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof TypeError) return 'Não foi possível conectar ao servidor. Verifique sua conexão.'
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

/** Session/account state (Fase 9) — see docs/ARCHITECTURE.md § Autenticação. Owns switching the
 * active LayoutRepository (local vs. remote) alongside every state transition, so no other part
 * of the app needs to know about the swap. */
export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  error: null,

  async bootstrap() {
    try {
      const { user } = await apiFetch<{ user: AuthUser }>('/api/auth/me')
      activateRemoteRepository(user.id)
      set({ status: 'authenticated', user, error: null })
    } catch {
      activateLocalRepository()
      set({ status: 'unauthenticated', user: null })
    }
  },

  async signup(email) {
    set({ error: null })
    try {
      await apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email }) })
    } catch (err) {
      set({ error: messageFor(err) })
      throw err
    }
  },

  async login(email, password) {
    set({ error: null })
    try {
      const { user } = await apiFetch<{ user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      activateRemoteRepository(user.id)
      set({ status: 'authenticated', user, error: null })
    } catch (err) {
      set({ error: messageFor(err) })
      throw err
    }
  },

  async logout() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Best-effort — the local session state is cleared regardless, so the user is never stuck
      // "logged in" in the UI just because the network call failed.
    }
    activateLocalRepository()
    set({ status: 'unauthenticated', user: null, error: null })
  },

  async changePassword(currentPassword, newPassword) {
    set({ error: null })
    try {
      const { user } = await apiFetch<{ user: AuthUser }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      set({ user, error: null })
    } catch (err) {
      set({ error: messageFor(err) })
      throw err
    }
  },

  async forgotPassword(email) {
    set({ error: null })
    try {
      await apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
    } catch (err) {
      set({ error: messageFor(err) })
      throw err
    }
  },

  async resetPassword(token, newPassword) {
    set({ error: null })
    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      })
    } catch (err) {
      set({ error: messageFor(err) })
      throw err
    }
  },

  clearError() {
    set({ error: null })
  },
}))
