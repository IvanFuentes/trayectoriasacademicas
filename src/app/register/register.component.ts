import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [AuthService], // ⬅️ agrega esto si el servicio no es 'providedIn: root'
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  token = ''; email = ''; username = ''; fullName = '';
  password = ''; confirmPassword = '';

  isLoading = false; showPassword = false;
  errorMessage = ''; successMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  togglePasswordVisibility(): void { this.showPassword = !this.showPassword; }

  async onSubmit(form: NgForm): Promise<void> {
    this.errorMessage = ''; this.successMessage = '';

    if (form.invalid) { this.errorMessage = 'Completa los campos requeridos.'; return; }
    if (this.password !== this.confirmPassword) { this.errorMessage = 'Las contraseñas no coinciden.'; return; }
    if (this.password.length < 6) { this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.'; return; }

    this.isLoading = true;
    try {
      await this.auth.registerWithToken(this.email, this.username, this.fullName, this.password, this.token);
      this.successMessage = 'Cuenta creada exitosamente. Redirigiendo…';
      setTimeout(() => this.router.navigate(['/login']), 800);
    } catch (e: any) {
      this.errorMessage = e?.message || 'Error al crear la cuenta.';
    } finally {
      this.isLoading = false;
    }
  }
}
