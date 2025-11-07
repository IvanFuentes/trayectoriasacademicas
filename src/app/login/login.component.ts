import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // 🧩 Propiedades necesarias para el HTML
  email = '';              // campo de correo electrónico
  password = '';           // campo de contraseña
  showPassword = false;    // controla visibilidad del input contraseña
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  // 👁️ Alternar visibilidad del password
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // 🔐 Manejo del login
  async onSubmit(form: NgForm): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    this.isLoading = true;

    try {
      // Usamos el correo como "username" para compatibilidad con tu backend actual
      const user = await this.authService.login(this.email, this.password);
      this.successMessage = `¡Bienvenido ${user.full_name || (user as any).username || 'usuario'}!`;

      setTimeout(() => this.router.navigate(['/dashboard']), 1000);
    } catch (error: any) {
      console.error('Error de login:', error);
      this.errorMessage = error?.message || 'Error al iniciar sesión.';
    } finally {
      this.isLoading = false;
    }
  }
}
