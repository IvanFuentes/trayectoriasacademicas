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

interface InstitucionData {
  totalSesiones: number;
  sesionesRegistradas: number;
  sesionesPendientes: number;
  sesionesFuturas: number;
  totalPresentes: number;
  totalAusentes: number;
  totalPendientes: number;
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
  institucion: InstitucionData = {
    totalSesiones: 0,
    sesionesRegistradas: 0,
    sesionesPendientes: 0,
    sesionesFuturas: 0,
    totalPresentes: 0,
    totalAusentes: 0,
    totalPendientes: 0
  };
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
          id: 2,
          nombre: 'Ingeniería en Animación Digital y Efectos Visuales',
          totalSesiones: 135,
          sesionesRegistradas: 85,
          sesionesPendientes: 20,
          sesionesFuturas: 30,
          totalEstudiantes: 80,
          totalPresentes: 2800,
          totalAusentes: 280,
          totalPendientes: 520,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Modelado 3D Avanzado',
              clave: 'IAD-1012',
              grupo: '4A',
              docente: 'M.C. Diego Torres Vega',
              totalEstudiantes: 25,
              presentes: 220,
              ausentes: 20,
              pendientes: 35
            },
            {
              nombre: 'Efectos Visuales',
              clave: 'IAD-1008',
              grupo: '4A',
              docente: 'Lic. Carmen Rodríguez Luna',
              totalEstudiantes: 25,
              presentes: 210,
              ausentes: 25,
              pendientes: 40
            }
          ]
        },
        {
          id: 3,
          nombre: 'Ingeniería en Energías Renovables',
          totalSesiones: 142,
          sesionesRegistradas: 92,
          sesionesPendientes: 23,
          sesionesFuturas: 27,
          totalEstudiantes: 88,
          totalPresentes: 3100,
          totalAusentes: 310,
          totalPendientes: 550,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Energía Solar Fotovoltaica',
              clave: 'IER-1015',
              grupo: '5A',
              docente: 'Dr. Roberto Campos Méndez',
              totalEstudiantes: 30,
              presentes: 260,
              ausentes: 25,
              pendientes: 35
            },
            {
              nombre: 'Sistemas Eólicos',
              clave: 'IER-1020',
              grupo: '5A',
              docente: 'M.I. Laura Jiménez Castro',
              totalEstudiantes: 28,
              presentes: 245,
              ausentes: 20,
              pendientes: 30
            }
          ]
        },
        {
          id: 4,
          nombre: 'Ingeniería en Industrias Alimentarias',
          totalSesiones: 138,
          sesionesRegistradas: 86,
          sesionesPendientes: 24,
          sesionesFuturas: 28,
          totalEstudiantes: 92,
          totalPresentes: 3050,
          totalAusentes: 305,
          totalPendientes: 545,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Tecnología de Alimentos',
              clave: 'IIA-1018',
              grupo: '6A',
              docente: 'Dr. Javier Morales Ortiz',
              totalEstudiantes: 31,
              presentes: 265,
              ausentes: 28,
              pendientes: 32
            },
            {
              nombre: 'Control de Calidad',
              clave: 'IIA-1005',
              grupo: '6B',
              docente: 'M.C. Sandra López Flores',
              totalEstudiantes: 30,
              presentes: 255,
              ausentes: 27,
              pendientes: 33
            }
          ]
        },
        {
          id: 5,
          nombre: 'Ingeniería en Inteligencia Artificial',
          totalSesiones: 148,
          sesionesRegistradas: 96,
          sesionesPendientes: 24,
          sesionesFuturas: 28,
          totalEstudiantes: 110,
          totalPresentes: 3850,
          totalAusentes: 385,
          totalPendientes: 665,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Machine Learning',
              clave: 'IIA-1025',
              grupo: '7A',
              docente: 'Dr. Fernando García Luna',
              totalEstudiantes: 35,
              presentes: 310,
              ausentes: 30,
              pendientes: 35
            },
            {
              nombre: 'Redes Neuronales',
              clave: 'IIA-1028',
              grupo: '7A',
              docente: 'Dra. Patricia Hernández Ruiz',
              totalEstudiantes: 35,
              presentes: 305,
              ausentes: 32,
              pendientes: 38
            },
            {
              nombre: 'Procesamiento de Lenguaje Natural',
              clave: 'IIA-1030',
              grupo: '7B',
              docente: 'M.C. Jorge Ramírez Santos',
              totalEstudiantes: 32,
              presentes: 280,
              ausentes: 28,
              pendientes: 36
            }
          ]
        },
        {
          id: 6,
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
          id: 7,
          nombre: 'Ingeniería Ferroviaria',
          totalSesiones: 132,
          sesionesRegistradas: 82,
          sesionesPendientes: 21,
          sesionesFuturas: 29,
          totalEstudiantes: 75,
          totalPresentes: 2600,
          totalAusentes: 260,
          totalPendientes: 490,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Sistemas de Tracción',
              clave: 'IFE-1022',
              grupo: '6A',
              docente: 'Dr. Alberto Mendoza Cruz',
              totalEstudiantes: 25,
              presentes: 215,
              ausentes: 22,
              pendientes: 38
            },
            {
              nombre: 'Infraestructura Ferroviaria',
              clave: 'IFE-1018',
              grupo: '6A',
              docente: 'Ing. Miguel Ángel Torres',
              totalEstudiantes: 24,
              presentes: 210,
              ausentes: 20,
              pendientes: 34
            }
          ]
        },
        {
          id: 8,
          nombre: 'Licenciatura en Administración',
          totalSesiones: 145,
          sesionesRegistradas: 91,
          sesionesPendientes: 26,
          sesionesFuturas: 28,
          totalEstudiantes: 105,
          totalPresentes: 3650,
          totalAusentes: 365,
          totalPendientes: 635,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Administración Estratégica',
              clave: 'LAD-1010',
              grupo: '8A',
              docente: 'M.A. Rosa María Gutiérrez',
              totalEstudiantes: 35,
              presentes: 295,
              ausentes: 30,
              pendientes: 35
            },
            {
              nombre: 'Recursos Humanos',
              clave: 'LAD-1015',
              grupo: '8B',
              docente: 'Lic. Pedro Sánchez Martínez',
              totalEstudiantes: 33,
              presentes: 285,
              ausentes: 28,
              pendientes: 32
            }
          ]
        },
        {
          id: 9,
          nombre: 'Licenciatura en Administración (Mixta)',
          totalSesiones: 128,
          sesionesRegistradas: 78,
          sesionesPendientes: 22,
          sesionesFuturas: 28,
          totalEstudiantes: 85,
          totalPresentes: 2800,
          totalAusentes: 280,
          totalPendientes: 520,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Finanzas Corporativas',
              clave: 'LAM-1012',
              grupo: '4A',
              docente: 'M.F. Adriana Flores Reyes',
              totalEstudiantes: 28,
              presentes: 235,
              ausentes: 24,
              pendientes: 36
            },
            {
              nombre: 'Marketing Estratégico',
              clave: 'LAM-1008',
              grupo: '4A',
              docente: 'Lic. Ricardo Pérez Luna',
              totalEstudiantes: 27,
              presentes: 230,
              ausentes: 23,
              pendientes: 32
            }
          ]
        },
        {
          id: 10,
          nombre: 'Licenciatura en Gastronomía',
          totalSesiones: 136,
          sesionesRegistradas: 84,
          sesionesPendientes: 23,
          sesionesFuturas: 29,
          totalEstudiantes: 90,
          totalPresentes: 3000,
          totalAusentes: 300,
          totalPendientes: 540,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Cocina Internacional',
              clave: 'LGA-1020',
              grupo: '5A',
              docente: 'Chef Martha Velázquez',
              totalEstudiantes: 30,
              presentes: 255,
              ausentes: 26,
              pendientes: 34
            },
            {
              nombre: 'Repostería Avanzada',
              clave: 'LGA-1018',
              grupo: '5B',
              docente: 'Chef Antonio Ramírez',
              totalEstudiantes: 28,
              presentes: 240,
              ausentes: 24,
              pendientes: 31
            }
          ]
        },
        {
          id: 11,
          nombre: 'Licenciatura en Turismo',
          totalSesiones: 133,
          sesionesRegistradas: 83,
          sesionesPendientes: 22,
          sesionesFuturas: 28,
          totalEstudiantes: 82,
          totalPresentes: 2850,
          totalAusentes: 285,
          totalPendientes: 515,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Gestión de Destinos Turísticos',
              clave: 'LTU-1015',
              grupo: '6A',
              docente: 'M.T. Gloria Herrera Castro',
              totalEstudiantes: 27,
              presentes: 235,
              ausentes: 23,
              pendientes: 34
            },
            {
              nombre: 'Ecoturismo',
              clave: 'LTU-1012',
              grupo: '6A',
              docente: 'Lic. Fernando Díaz Ruiz',
              totalEstudiantes: 26,
              presentes: 225,
              ausentes: 22,
              pendientes: 33
            }
          ]
        },
        {
          id: 12,
          nombre: 'Posgrado',
          totalSesiones: 125,
          sesionesRegistradas: 80,
          sesionesPendientes: 20,
          sesionesFuturas: 25,
          totalEstudiantes: 65,
          totalPresentes: 2400,
          totalAusentes: 240,
          totalPendientes: 440,
          expanded: false,
          asignaturas: [
            {
              nombre: 'Metodología de la Investigación',
              clave: 'POS-1005',
              grupo: 'M1',
              docente: 'Dr. Héctor Navarro Silva',
              totalEstudiantes: 22,
              presentes: 195,
              ausentes: 18,
              pendientes: 32
            },
            {
              nombre: 'Seminario de Tesis',
              clave: 'POS-1008',
              grupo: 'M2',
              docente: 'Dra. Elena Martínez Ortega',
              totalEstudiantes: 20,
              presentes: 180,
              ausentes: 16,
              pendientes: 29
            }
          ]
        }
      ];
      this.calculateInstitucionTotals();
      this.isLoading = false;
    }, 500);
  }

  calculateInstitucionTotals(): void {
    this.institucion = {
      totalSesiones: this.carreras.reduce((sum, c) => sum + c.totalSesiones, 0),
      sesionesRegistradas: this.carreras.reduce((sum, c) => sum + c.sesionesRegistradas, 0),
      sesionesPendientes: this.carreras.reduce((sum, c) => sum + c.sesionesPendientes, 0),
      sesionesFuturas: this.carreras.reduce((sum, c) => sum + c.sesionesFuturas, 0),
      totalPresentes: this.carreras.reduce((sum, c) => sum + c.totalPresentes, 0),
      totalAusentes: this.carreras.reduce((sum, c) => sum + c.totalAusentes, 0),
      totalPendientes: this.carreras.reduce((sum, c) => sum + c.totalPendientes, 0)
    };
  }

  toggleCarrera(carrera: CarreraData): void {
    carrera.expanded = !carrera.expanded;
  }

  getSeguimientoGeneralChartData(): { porcentaje: number; color: string; label: string }[] {
    const total = this.institucion.totalSesiones;
    return [
      {
        porcentaje: (this.institucion.sesionesRegistradas / total) * 100,
        color: '#10b981',
        label: 'Registradas'
      },
      {
        porcentaje: (this.institucion.sesionesPendientes / total) * 100,
        color: '#ef4444',
        label: 'Pendientes'
      },
      {
        porcentaje: (this.institucion.sesionesFuturas / total) * 100,
        color: '#9ca3af',
        label: 'Futuras'
      }
    ];
  }

  getBalanceGeneralChartData(): { porcentaje: number; color: string; label: string }[] {
    const total = this.institucion.totalPresentes + this.institucion.totalAusentes + this.institucion.totalPendientes;
    return [
      {
        porcentaje: (this.institucion.totalPresentes / total) * 100,
        color: '#10b981',
        label: 'Presentes'
      },
      {
        porcentaje: (this.institucion.totalAusentes / total) * 100,
        color: '#ef4444',
        label: 'Ausentes'
      },
      {
        porcentaje: (this.institucion.totalPendientes / total) * 100,
        color: '#fbbf24',
        label: 'Pendientes'
      }
    ];
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
