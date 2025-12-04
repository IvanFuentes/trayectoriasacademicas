import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ReporteDesercion {
  id: number;
  fecha: string;
  estudiante: string;
  matricula: string;
  carrera: string;
  estatus: 'Activo' | 'En riesgo' | 'Crítico';
}

@Component({
  selector: 'app-alerta-desercion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerta-desercion.component.html',
  styleUrl: './alerta-desercion.component.css'
})
export class AlertaDesercionComponent implements OnInit {
  reportes: ReporteDesercion[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadReportes();
  }

  loadReportes(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.reportes = [
        {
          id: 1,
          fecha: '2025-12-01',
          estudiante: 'JUAN PÉREZ GARCÍA',
          matricula: '230211001',
          carrera: 'Ingeniería en Sistemas Computacionales',
          estatus: 'Crítico'
        },
        {
          id: 2,
          fecha: '2025-12-02',
          estudiante: 'MARÍA LÓPEZ HERNÁNDEZ',
          matricula: '230211002',
          carrera: 'Contador Público',
          estatus: 'En riesgo'
        },
        {
          id: 3,
          fecha: '2025-12-03',
          estudiante: 'CARLOS RAMÍREZ FLORES',
          matricula: '230211003',
          carrera: 'Ingeniería Industrial',
          estatus: 'Activo'
        }
      ];
      this.isLoading = false;
    }, 500);
  }

  getEstatusClass(estatus: string): string {
    switch(estatus) {
      case 'Crítico': return 'critico';
      case 'En riesgo': return 'en-riesgo';
      case 'Activo': return 'activo';
      default: return '';
    }
  }

  verInformacion(reporte: ReporteDesercion): void {
    console.log('Ver información:', reporte);
  }

  generarInforme(reporte: ReporteDesercion): void {
    console.log('Generar informe:', reporte);
  }
}
