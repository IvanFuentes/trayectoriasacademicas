// src/app/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  // Campos ligados a [(ngModel)] en tu HTML
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  token = ''; // si tu flujo usa token de invitación

  // Estado UI
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(form?: NgForm): Promise<void> {
    if (form && form.invalid) {
      this.errorMessage = 'Completa los campos requeridos.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // TODO: reemplaza por tu servicio real (Supabase / API propia)
      await fakeRegister({
        username: this.username,
        email: this.email,
        password: this.password,
        token: this.token,
      });

      this.successMessage = 'Cuenta creada. Redirigiendo al inicio de sesión…';
      setTimeout(() => this.router.navigate(['/login']), 800);
    } catch (err: any) {
      this.errorMessage = err?.message || 'No se pudo crear la cuenta.';
    } finally {
      this.isLoading = false;
    }
  }
}

/** Simulación: reemplazar por llamada real a tu backend/Supabase */
function fakeRegister(payload: { username: string; email: string; password: string; token?: string; }): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // ejemplo tonto de validación de token
      if (payload.token && payload.token.length < 4) {
        reject(new Error('Token inválido.'));
      } else {
        resolve();
      }
    }, 700);
  });
}
