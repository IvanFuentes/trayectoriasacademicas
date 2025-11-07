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
  // 👇 propiedades que causaban el error
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit(form: NgForm): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    this.isLoading = true;

    try {
      const user = await this.authService.login(this.username, this.password);
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
