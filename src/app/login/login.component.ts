import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  // Campos ligados a [(ngModel)]
  username = '';
  password = '';

  // Estado UI
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(form?: NgForm): Promise<void> {
    // Si usas #loginForm="ngForm" puedes validar con el form
    if (form && form.invalid) {
      this.errorMessage = 'Completa los campos requeridos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // TODO: reemplaza esto por tu servicio real de autenticación (Supabase, API, etc.)
      await fakeAuth(this.username, this.password);

      // Navega si todo va bien
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage = err?.message || 'Usuario o contraseña incorrectos.';
    } finally {
      this.isLoading = false;
    }
  }
}

/** Simulación de login (cámbiala por tu servicio real) */
function fakeAuth(user: string, pass: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      user === 'admin' && pass === 'admin123' ? resolve() : reject(new Error('Credenciales inválidas'));
    }, 700);
  });
}
