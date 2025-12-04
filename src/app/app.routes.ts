import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AlertaTempranaComponent } from './alerta-temprana/alerta-temprana.component';
import { IndicadoresAcademicosComponent } from './indicadores-academicos/indicadores-academicos.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'alerta-temprana',
    component: AlertaTempranaComponent,
    canActivate: [authGuard]
  },
  {
    path: 'indicadores-academicos',
    component: IndicadoresAcademicosComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
