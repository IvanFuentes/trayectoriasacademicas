import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  private readonly VALID_USERNAME = 'Admin-Jaguar';
  private readonly VALID_PASSWORD = 'Itse.Academia2025.-';

  constructor(private router: Router) {}

  onSubmit(): void {
    if (this.username === this.VALID_USERNAME && this.password === this.VALID_PASSWORD) {
      sessionStorage.setItem('isAuthenticated', 'true');
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Usuario o contraseña incorrectos';
      this.password = '';
    }
  }

  goBack(): void {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
