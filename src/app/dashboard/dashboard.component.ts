import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Module {
  id: string;
  title: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  modules: Module[] = [
    {
      id: 'alerta-temprana',
      title: 'Alerta Temprana',
      icon: '🔔',
      color: '#6b8fa3'
    },
    {
      id: 'indicadores-academicos',
      title: 'Indicadores Académicos',
      icon: '📊',
      color: '#7a9fb5'
    },
    {
      id: 'proyeccion-academica',
      title: 'Proyección Académica',
      icon: '📈',
      color: '#8aafc7'
    }
  ];

  constructor(private router: Router) {}

  logout(): void {
    sessionStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }

  openModule(moduleId: string): void {
    if (moduleId === 'alerta-temprana') {
      this.router.navigate(['/alerta-temprana']);
    } else {
      console.log(`Módulo seleccionado: ${moduleId}`);
    }
  }
}
