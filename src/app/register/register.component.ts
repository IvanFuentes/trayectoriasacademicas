import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  isLoading = false;
  showPassword = false;
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(form: NgForm): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      this.errorMessage = 'Completa los campos requeridos.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Simulación de éxito para probar render + navegación
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Cuenta creada exitosamente. Redirigiendo…';
      setTimeout(() => this.router.navigate(['/login']), 800);
    }, 600);
  }
}
