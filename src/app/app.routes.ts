import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./welcome/welcome.component').then(m => m.WelcomeComponent),
    // canActivate: [publicGuard], // ← Actívalo cuando el guard esté listo
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
    // canActivate: [publicGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then(m => m.RegisterComponent),
    // canActivate: [publicGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    // canActivate: [authGuard],
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./admin/user-management/user-management.component')
        .then(m => m.UserManagementComponent),
    // canActivate: [authGuard, adminGuard],
  },
  {
    path: 'alerta-temprana',
    loadComponent: () =>
      import('./alerta-temprana/alerta-temprana.component')
        .then(m => m.AlertaTempranaComponent),
    // canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
