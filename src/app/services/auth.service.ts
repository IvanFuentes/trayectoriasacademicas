import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

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
  role?: {
    name: string;
    level: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const supabase = this.supabaseService.getClient();
    const userId = sessionStorage.getItem('userId');

    if (userId) {
      supabase
        .from('users')
        .select('*, roles(name, level)')
        .eq('id', userId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            this.userSubject.next(data as User);
          }
        });
    }
  }

  registerWithToken(email: string, username: string, fullName: string, password: string, token: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    return new Promise(async (resolve, reject) => {
      try {
        // Verify token exists and is not used
        const { data: tokenData, error: tokenError } = await supabase
          .from('invitation_tokens')
          .select('*')
          .eq('token', token)
          .eq('is_used', false)
          .maybeSingle();

        if (tokenError || !tokenData) {
          reject(new Error('Token inválido o ya fue utilizado'));
          return;
        }

        if (new Date(tokenData.expires_at) < new Date()) {
          reject(new Error('Token ha expirado'));
          return;
        }

        // Create user
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert([{
            email,
            username,
            full_name: fullName,
            role_id: tokenData.role_id,
            invitation_token_id: tokenData.id,
            created_by: tokenData.created_by
          }])
          .select()
          .single();

        if (userError) {
          reject(new Error(userError.message));
          return;
        }

        // Mark token as used
        await supabase
          .from('invitation_tokens')
          .update({ is_used: true, used_by: newUser.id, used_at: new Date().toISOString() })
          .eq('id', tokenData.id);

        sessionStorage.setItem('userId', newUser.id);
        sessionStorage.setItem('isAuthenticated', 'true');
        this.userSubject.next(newUser as User);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  login(username: string, password: string): Promise<User> {
    const supabase = this.supabaseService.getClient();

    return new Promise(async (resolve, reject) => {
      try {
        // For now, just verify user exists. In production, use Supabase Auth
        const { data, error } = await supabase
          .from('users')
          .select('*, roles(name, level)')
          .eq('username', username)
          .eq('is_active', true)
          .maybeSingle();

        if (error || !data) {
          reject(new Error('Usuario o contraseña incorrectos'));
          return;
        }

        // Store user data
        sessionStorage.setItem('userId', data.id);
        sessionStorage.setItem('isAuthenticated', 'true');
        this.userSubject.next(data as User);

        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);

        resolve(data as User);
      } catch (error) {
        reject(error);
      }
    });
  }

  logout(): void {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('isAuthenticated');
    this.userSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.userSubject.getValue();
  }

  isAdmin(): boolean {
    const user = this.userSubject.getValue();
    return user?.role?.name === 'admin';
  }
}
