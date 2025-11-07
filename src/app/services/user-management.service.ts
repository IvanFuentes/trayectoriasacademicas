import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface InvitationToken {
  id: string;
  token: string;
  role_id: string;
  role?: {
    name: string;
  };
  created_by: string;
  created_admin?: {
    full_name: string;
  };
  is_used: boolean;
  used_by: string | null;
  used_by_user?: {
    full_name: string;
    email: string;
  };
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role_id: string;
  role?: {
    name: string;
    level: number;
  };
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  constructor(private supabaseService: SupabaseService) {}

  // Generate invitation token
  generateInvitationToken(roleId: string, expiresIn: number = 7): Promise<InvitationToken> {
    const supabase = this.supabaseService.getClient();
    const token = this.generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    return new Promise(async (resolve, reject) => {
      try {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
          reject(new Error('Usuario no autenticado'));
          return;
        }

        const { data, error } = await supabase
          .from('invitation_tokens')
          .insert([{
            token,
            role_id: roleId,
            created_by: userId,
            expires_at: expiresAt.toISOString()
          }])
          .select('*, roles(name), created_by_admin:users(full_name)')
          .single();

        if (error) {
          reject(new Error(error.message));
          return;
        }

        resolve(data as InvitationToken);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Get all invitation tokens
  getInvitationTokens(): Promise<InvitationToken[]> {
    const supabase = this.supabaseService.getClient();

    return new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase
          .from('invitation_tokens')
          .select(`
            *,
            roles(name),
            created_by_admin:users(full_name),
            used_by_user:users(full_name, email)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          reject(new Error(error.message));
          return;
        }

        resolve(data as InvitationToken[]);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Revoke invitation token
  revokeInvitationToken(tokenId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    return new Promise(async (resolve, reject) => {
      try {
        const { error } = await supabase
          .from('invitation_tokens')
          .delete()
          .eq('id', tokenId)
          .eq('is_used', false);

        if (error) {
          reject(new Error(error.message));
          return;
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Get all users
  getAllUsers(): Promise<UserWithRole[]> {
    const supabase = this.supabaseService.getClient();

    return new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*, roles(name, level)')
          .order('created_at', { ascending: false });

        if (error) {
          reject(new Error(error.message));
          return;
        }

        resolve(data as UserWithRole[]);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Update user role
  updateUserRole(userId: string, roleId: string): Promise<UserWithRole> {
    const supabase = this.supabaseService.getClient();

    return new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({ role_id: roleId, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select('*, roles(name, level)')
          .single();

        if (error) {
          reject(new Error(error.message));
          return;
        }

        resolve(data as UserWithRole);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Deactivate user
  deactivateUser(userId: string): Promise<UserWithRole> {
    const supabase = this.supabaseService.getClient();

    return new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select('*, roles(name, level)')
          .single();

        if (error) {
          reject(new Error(error.message));
          return;
        }

        resolve(data as UserWithRole);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Activate user
  activateUser(userId: string): Promise<UserWithRole> {
    const supabase = this.supabaseService.getClient();

    return new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select('*, roles(name, level)')
          .single();

        if (error) {
          reject(new Error(error.message));
          return;
        }

        resolve(data as UserWithRole);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Get all roles
  getRoles(): Promise<Role[]> {
    const supabase = this.supabaseService.getClient();

    return new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .order('level', { ascending: true });

        if (error) {
          reject(new Error(error.message));
          return;
        }

        resolve(data as Role[]);
      } catch (error) {
        reject(error);
      }
    });
  }

  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
