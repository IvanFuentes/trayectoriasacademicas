import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  token: string = '';
  email: string = '';
  username: string = '';
  fullName: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

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
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      })
      .catch(error => {
        this.errorMessage = error.message || 'Error al crear la cuenta';
        this.isLoading = false;
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
