import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService, InvitationToken, UserWithRole, Role } from '../../services/user-management.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: UserWithRole[] = [];
  invitationTokens: InvitationToken[] = [];
  roles: Role[] = [];
  activeTab: 'users' | 'tokens' = 'users';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  selectedRoleForToken: string = '';
  showTokenForm: boolean = false;
  selectedUserForEdit: UserWithRole | null = null;
  editingRole: string = '';

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    Promise.all([
      this.userManagementService.getRoles(),
      this.userManagementService.getAllUsers(),
      this.userManagementService.getInvitationTokens()
    ]).then(([roles, users, tokens]) => {
      this.roles = roles;
      this.users = users;
      this.invitationTokens = tokens;
      this.isLoading = false;
    }).catch(error => {
      this.errorMessage = error.message;
      this.isLoading = false;
    });
  }

  generateToken(): void {
    if (!this.selectedRoleForToken) {
      this.errorMessage = 'Selecciona un rol';
      return;
    }

    this.isLoading = true;
    this.userManagementService.generateInvitationToken(this.selectedRoleForToken)
      .then(token => {
        this.invitationTokens.unshift(token);
        this.successMessage = 'Token generado exitosamente';
        this.selectedRoleForToken = '';
        this.showTokenForm = false;
        this.errorMessage = '';
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      })
      .catch(error => {
        this.errorMessage = error.message;
        this.isLoading = false;
      });
  }

  revokeToken(tokenId: string): void {
    if (confirm('¿Estás seguro de que deseas revocar este token?')) {
      this.userManagementService.revokeInvitationToken(tokenId)
        .then(() => {
          this.invitationTokens = this.invitationTokens.filter(t => t.id !== tokenId);
          this.successMessage = 'Token revocado exitosamente';
          setTimeout(() => this.successMessage = '', 3000);
        })
        .catch(error => {
          this.errorMessage = error.message;
        });
    }
  }

  startEditUser(user: UserWithRole): void {
    this.selectedUserForEdit = user;
    this.editingRole = user.role_id;
  }

  cancelEdit(): void {
    this.selectedUserForEdit = null;
    this.editingRole = '';
  }

  saveUserChanges(): void {
    if (!this.selectedUserForEdit) return;

    this.isLoading = true;
    this.userManagementService.updateUserRole(this.selectedUserForEdit.id, this.editingRole)
      .then(updatedUser => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.successMessage = 'Usuario actualizado exitosamente';
        this.selectedUserForEdit = null;
        this.editingRole = '';
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      })
      .catch(error => {
        this.errorMessage = error.message;
        this.isLoading = false;
      });
  }

  deactivateUser(userId: string): void {
    if (confirm('¿Estás seguro de que deseas desactivar este usuario?')) {
      this.userManagementService.deactivateUser(userId)
        .then(updatedUser => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.successMessage = 'Usuario desactivado';
          setTimeout(() => this.successMessage = '', 3000);
        })
        .catch(error => {
          this.errorMessage = error.message;
        });
    }
  }

  activateUser(userId: string): void {
    this.userManagementService.activateUser(userId)
      .then(updatedUser => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.successMessage = 'Usuario activado';
        setTimeout(() => this.successMessage = '', 3000);
      })
      .catch(error => {
        this.errorMessage = error.message;
      });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.successMessage = 'Token copiado al portapapeles';
      setTimeout(() => this.successMessage = '', 2000);
    });
  }

  formatDate(date: string | null): string {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleString('es-ES');
  }

  getRoleName(roleId: string): string {
    return this.roles.find(r => r.id === roleId)?.name || 'Desconocido';
  }

  isTokenExpired(token: InvitationToken): boolean {
    return new Date(token.expires_at) < new Date();
  }
}
