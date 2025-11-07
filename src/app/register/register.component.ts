// src/app/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // <-- agrega RouterModule
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  token = '';
  email = '';
  username = '';
  fullName = '';
  password = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(form?: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (form && form.invalid) {
      this.errorMessage = 'Completa los campos requeridos';
      return;
    }
    if (!this.token || !this.email || !this.username || !this.fullName || !this.password) {
      this.errorMessage = 'Todos los campos son requeridos';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.isLoading = true;
    this.authService.registerWithToken(this.email, this.username, this.fullName, this.password, this.token)
      .then(() => {
        this.successMessage = 'Cuenta creada exitosamente';
        setTimeout(() => this.router.navigate(['/dashboard']), 800);
      })
      .catch(err => {
        this.errorMessage = err?.message || 'Error al crear la cuenta';
      })
      .finally(() => this.isLoading = false);
  }
}
