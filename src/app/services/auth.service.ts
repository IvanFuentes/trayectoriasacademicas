import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { SupabaseService } from './supabase.service';

/* ===== Tipos base ===== */
export interface Role {
  name: string;
  level: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role_id: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  role?: Role;
}

export interface InvitationToken {
  id: string;
  token: string;
  role_id: string;
  created_by: string;
  is_used: boolean;
  expires_at: string;            // ISO string
  used_by?: string | null;
  used_at?: string | null;
}

/* ===== Servicio ===== */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).getClient();

  /** Fuente de verdad en memoria del usuario actual */
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  /** Observable público */
  readonly user$: Observable<User | null> = this.userSubject.asObservable();

  constructor() {
    // Carga inicial (no bloqueante)
    void this.loadCurrentUser();
  }

  /* ---------- API Pública ---------- */

  /** Devuelve el usuario actual (o null) */
  getCurrentUser(): User | null {
    return this.userSubject.getValue();
  }

  /** ¿Hay sesión activa? (sincrónica) */
  isAuthenticated(): boolean {
    // Considera sesión si tenemos user en memoria o flag en storage
    return !!this.userSubject.getValue() || this.getStorage('isAuthenticated') === 'true';
  }

  /** ¿Hay sesión activa? (reactiva) */
  isAuthenticated$(): Observable<boolean> {
    return this.user$.pipe(map(u => !!u));
  }

  /** ¿Usuario con rol admin? (sincrónica) */
  isAdmin(): boolean {
    const u = this.userSubject.getValue();
    return (u?.role?.name ?? '').toLowerCase() === 'admin';
  }

  /** Cerrar sesión */
  logout(): void {
    this.removeStorage('userId');
    this.removeStorage('isAuthenticated');
    this.userSubject.next(null);
  }

  /** Login “demo”: valida existencia de usuario activo por username.
   *  En producción, integra Supabase Auth o tu backend. */
  async login(username: string, password: string): Promise<User> {
    try {
      // Aquí podrías validar el password con tu backend o Supabase Auth
      const { data, error } = await this.supabase
        .from('users')
        .select('*, roles(name, level)')
        .eq('username', username)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      // Actualiza last_login (no bloquea el flujo si falla)
      void this.supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      this.setStorage('userId', data.id);
      this.setStorage('isAuthenticated', 'true');

      const user = this.normalizeUser(data);
      this.userSubject.next(user);
      return user;
    } catch (e: any) {
      throw new Error(e?.message || 'No se pudo iniciar sesión');
    }
  }

  /** Registro con token de invitación */
  async registerWithToken(
    email: string,
    username: string,
    fullName: string,
    password: string,   // reservado para tu backend/Auth
    token: string
  ): Promise<void> {
    try {
      // 1) Verificar token válido/no usado
      const { data: tokenData, error: tokenError } = await this.supabase
        .from('invitation_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_used', false)
        .maybeSingle<InvitationToken>();

      if (tokenError || !tokenData) {
        throw new Error('Token inválido o ya fue utilizado');
      }

      if (new Date(tokenData.expires_at).getTime() < Date.now()) {
        throw new Error('El token ha expirado');
      }

      // 2) Crear usuario (NOTA: gestiona contraseña con tu Auth real)
      const { data: newUser, error: userError } = await this.supabase
        .from('users')
        .insert([
          {
            email,
            username,
            full_name: fullName,
            role_id: tokenData.role_id,
            invitation_token_id: tokenData.id,
            created_by: tokenData.created_by,
            is_active: true
          }
        ])
        .select('*, roles(name, level)')
        .single<User>();

      if (userError || !newUser) {
        throw new Error(userError?.message || 'No se pudo crear el usuario');
      }

      // 3) Marcar token como usado (si falla, avisar; podrías “revertir” si lo deseas)
      const { error: markError } = await this.supabase
        .from('invitation_tokens')
        .update({
          is_used: true,
          used_by: newUser.id,
          used_at: new Date().toISOString()
        })
        .eq('id', tokenData.id);

      if (markError) {
        // Opcional: rollback del user creado
        // await this.supabase.from('users').delete().eq('id', newUser.id);
        throw new Error('El usuario fue creado, pero no se pudo cerrar el token');
      }

      // 4) Persistir sesión mínima
      this.setStorage('userId', newUser.id);
      this.setStorage('isAuthenticated', 'true');
      this.userSubject.next(this.normalizeUser(newUser));
    } catch (e: any) {
      throw new Error(e?.message || 'No se pudo completar el registro');
    }
  }

  /* ---------- Helpers internos ---------- */

  /** Carga usuario desde storage y lo trae de BD */
  private async loadCurrentUser(): Promise<void> {
    const userId = this.getStorage('userId');
    if (!userId) return;

    try {
      const fresh = await this.fetchUserById(userId);
      if (fresh) this.userSubject.next(fresh);
    } catch {
      // Si falla, limpia estado corrupto
      this.logout();
    }
  }

  /** Obtiene usuario por id con el rol ya resuelto */
  private async fetchUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*, roles(name, level)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.normalizeUser(data);
  }

  /** Normaliza la forma del join de roles → user.role */
  private normalizeUser(raw: any): User {
    const role: Role | undefined =
      raw?.roles ? { name: raw.roles.name, level: raw.roles.level } : raw?.role;

    const u: User = {
      id: raw.id,
      email: raw.email,
      username: raw.username,
      full_name: raw.full_name,
      role_id: raw.role_id,
      is_active: raw.is_active,
      last_login: raw.last_login ?? null,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      role
    };
    return u;
  }

  /* ---------- Storage seguro (evita fallos en SSR/tests) ---------- */

  private get hasWindow(): boolean {
    return typeof window !== 'undefined';
  }

  private setStorage(key: string, value: string): void {
    try {
      if (this.hasWindow && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch { /* ignore */ }
  }

  private getStorage(key: string): string | null {
    try {
      if (this.hasWindow && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
      return null;
    } catch {
      return null;
    }
  }

  private removeStorage(key: string): void {
    try {
      if (this.hasWindow && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch { /* ignore */ }
  }
}
