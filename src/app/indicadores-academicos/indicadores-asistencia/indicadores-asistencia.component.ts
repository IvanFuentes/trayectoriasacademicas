import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AsignaturaData {
  nombre: string;
  clave: string;
  grupo: string;
  docente: string;
  totalEstudiantes: number;
  presentes: number;
  ausentes: number;
  pendientes: number;
}

interface CarreraData {
  id: number;
  nombre: string;
  totalSesiones: number;
  sesionesRegistradas: number;
  sesionesPendientes: number;
  sesionesFuturas: number;
  totalEstudiantes: number;
  totalPresentes: number;
  totalAusentes: number;
  totalPendientes: number;
  asignaturas: AsignaturaData[];
  expanded: boolean;
}

@Component({
  selector: 'app-indicadores-asistencia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicadores-asistencia.component.html',
  styleUrl: './indicadores-asistencia.component.css'
})
export class IndicadoresAsistenciaComponent implements OnInit {
  carreras: CarreraData[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.carreras = [
        {
          id: 1,
          nombre: 'Ingeniería en Sistemas Computacionales',
          totalSesiones: 150,
          sesionesRegistradas: 95,
          sesionesPendientes: 25,
          sesionesFuturas: 30,
          totalEstudiantes: 120,
          totalPresentes: 4200,
          totalAusentes: 450,
          totalPendientes: 750,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Programación Orientada a Objetos',
              clave: 'SCC-1023',
              grupo: '5A',
              docente: 'Dr. Juan Pérez García',
              totalEstudiantes: 35,
              presentes: 280,
              ausentes: 35,
              pendientes: 35
            },
            {
              nombre: 'Base de Datos',
              clave: 'SCC-1004',
              grupo: '5A',
              docente: 'M.C. María López Hernández',
              totalEstudiantes: 35,
              presentes: 295,
              ausentes: 25,
              pendientes: 30
            },
            {
              nombre: 'Redes de Computadoras',
              clave: 'SCC-1019',
              grupo: '5B',
              docente: 'Ing. Carlos Ramírez Flores',
              totalEstudiantes: 30,
              presentes: 250,
              ausentes: 30,
              pendientes: 20
            }
          ]
        },
        {
          id: 2,
          nombre: 'Contador Público',
          totalSesiones: 140,
          sesionesRegistradas: 88,
          sesionesPendientes: 22,
          sesionesFuturas: 30,
          totalEstudiantes: 95,
          totalPresentes: 3200,
          totalAusentes: 320,
          totalPendientes: 580,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Contabilidad Financiera',
              clave: 'CPD-1004',
              grupo: '3A',
              docente: 'Lic. Ana Martínez Ruiz',
              totalEstudiantes: 32,
              presentes: 250,
              ausentes: 30,
              pendientes: 32
            },
            {
              nombre: 'Auditoría',
              clave: 'CPD-1002',
              grupo: '3B',
              docente: 'C.P. Roberto Sánchez Torres',
              totalEstudiantes: 28,
              presentes: 220,
              ausentes: 24,
              pendientes: 28
            }
          ]
        },
        {
          id: 3,
          nombre: 'Ingeniería Industrial',
          totalSesiones: 145,
          sesionesRegistradas: 90,
          sesionesPendientes: 28,
          sesionesFuturas: 27,
          totalEstudiantes: 105,
          totalPresentes: 3600,
          totalAusentes: 380,
          totalPendientes: 620,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Control Estadístico de Calidad',
              clave: 'INC-1006',
              grupo: '6A',
              docente: 'Dr. Luis Gómez Vargas',
              totalEstudiantes: 35,
              presentes: 290,
              ausentes: 30,
              pendientes: 30
            },
            {
              nombre: 'Estudio del Trabajo II',
              clave: 'INC-1009',
              grupo: '6A',
              docente: 'M.I. Patricia Díaz López',
              totalEstudiantes: 35,
              presentes: 285,
              ausentes: 35,
              pendientes: 30
            }
          ]
        }
      ];
      this.isLoading = false;
    }, 500);
  }

  toggleCarrera(carrera: CarreraData): void {
    carrera.expanded = !carrera.expanded;
  }

  getSeguimientoChartData(carrera: CarreraData): { porcentaje: number; color: string; label: string }[] {
    const total = carrera.totalSesiones;
    return [
      {
        porcentaje: (carrera.sesionesRegistradas / total) * 100,
        color: '#10b981',
        label: 'Registradas'
      },
      {
        porcentaje: (carrera.sesionesPendientes / total) * 100,
        color: '#ef4444',
        label: 'Pendientes'
      },
      {
        porcentaje: (carrera.sesionesFuturas / total) * 100,
        color: '#9ca3af',
        label: 'Futuras'
      }
    ];
  }

  getBalanceChartData(carrera: CarreraData): { porcentaje: number; color: string; label: string }[] {
    const total = carrera.totalPresentes + carrera.totalAusentes + carrera.totalPendientes;
    return [
      {
        porcentaje: (carrera.totalPresentes / total) * 100,
        color: '#10b981',
        label: 'Presentes'
      },
      {
        porcentaje: (carrera.totalAusentes / total) * 100,
        color: '#ef4444',
        label: 'Ausentes'
      },
      {
        porcentaje: (carrera.totalPendientes / total) * 100,
        color: '#fbbf24',
        label: 'Pendientes'
      }
    ];
  }

  getAsignaturaChartData(asignatura: AsignaturaData): { porcentaje: number; color: string; label: string }[] {
    const total = asignatura.presentes + asignatura.ausentes + asignatura.pendientes;
    return [
      {
        porcentaje: (asignatura.presentes / total) * 100,
        color: '#10b981',
        label: 'Presentes'
      },
      {
        porcentaje: (asignatura.ausentes / total) * 100,
        color: '#ef4444',
        label: 'Ausentes'
      },
      {
        porcentaje: (asignatura.pendientes / total) * 100,
        color: '#fbbf24',
        label: 'Pendientes'
      }
    ];
  }

  getPieChartPath(data: { porcentaje: number; color: string; label: string }[], index: number): string {
    let currentAngle = 0;
    for (let i = 0; i < index; i++) {
      currentAngle += (data[i].porcentaje / 100) * 360;
    }

    const angle = (data[index].porcentaje / 100) * 360;
    const startAngle = currentAngle - 90;
    const endAngle = startAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 50 + 45 * Math.cos(startRad);
    const y1 = 50 + 45 * Math.sin(startRad);
    const x2 = 50 + 45 * Math.cos(endRad);
    const y2 = 50 + 45 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }
}
