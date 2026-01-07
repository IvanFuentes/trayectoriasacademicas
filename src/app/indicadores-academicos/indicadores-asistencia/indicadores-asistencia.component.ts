import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoodleService, Carrera, SesionAsistencia } from '../../services/moodle.service';

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
  loading?: boolean;
  error?: string;
  sesiones?: SesionAsistencia[];
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
  errorMessage = '';

  constructor(private moodleService: MoodleService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.moodleService.getCarreras().subscribe({
      next: (carreras: Carrera[]) => {
        this.carreras = carreras.map(carrera => ({
          id: carrera.id,
          nombre: carrera.nombre,
          totalSesiones: 0,
          sesionesRegistradas: 0,
          sesionesPendientes: 0,
          sesionesFuturas: 0,
          totalEstudiantes: 0,
          totalPresentes: 0,
          totalAusentes: 0,
          totalPendientes: 0,
          asignaturas: [],
          expanded: false,
          loading: false
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading carreras:', error);
        this.errorMessage = 'Error al cargar las carreras. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
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
    if (carrera.expanded) {
      carrera.expanded = false;
    } else {
      carrera.expanded = true;
      if (!carrera.sesiones) {
        this.loadCarreraData(carrera);
      }
    }
  }

  loadCarreraData(carrera: CarreraData): void {
    carrera.loading = true;
    carrera.error = undefined;

    this.moodleService.getSesionesAsistencia(carrera.id).subscribe({
      next: (sesiones: SesionAsistencia[]) => {
        carrera.sesiones = sesiones;
        this.calculateCarreraMetrics(carrera);
        carrera.loading = false;
        this.calculateInstitucionTotals();
      },
      error: (error) => {
        console.error('Error loading sesiones:', error);
        carrera.error = 'Error al cargar los datos de asistencia';
        carrera.loading = false;
      }
    });
  }

  calculateCarreraMetrics(carrera: CarreraData): void {
    if (!carrera.sesiones) return;

    const sesiones = carrera.sesiones;
    carrera.totalSesiones = sesiones.length;
    carrera.sesionesRegistradas = sesiones.filter(s => s.estado === 'completado').length;
    carrera.sesionesPendientes = sesiones.filter(s => s.estado === 'pendiente').length;
    carrera.sesionesFuturas = sesiones.filter(s => s.estado === 'futuro').length;

    const asignaturas = this.agruparPorAsignatura(sesiones);
    carrera.asignaturas = asignaturas;

    carrera.totalEstudiantes = asignaturas.reduce((sum, a) => Math.max(sum, a.totalEstudiantes), 0);
    carrera.totalPresentes = asignaturas.reduce((sum, a) => sum + a.presentes, 0);
    carrera.totalAusentes = asignaturas.reduce((sum, a) => sum + a.ausentes, 0);
    carrera.totalPendientes = asignaturas.reduce((sum, a) => sum + a.pendientes, 0);
  }

  agruparPorAsignatura(sesiones: SesionAsistencia[]): AsignaturaData[] {
    const asignaturaMap = new Map<number, SesionAsistencia[]>();

    sesiones.forEach(sesion => {
      if (!asignaturaMap.has(sesion.cursoId)) {
        asignaturaMap.set(sesion.cursoId, []);
      }
      asignaturaMap.get(sesion.cursoId)!.push(sesion);
    });

    const asignaturas: AsignaturaData[] = [];

    asignaturaMap.forEach((sesionesCurso, cursoId) => {
      const primerasesion = sesionesCurso[0];

      const sesionesCompletadas = sesionesCurso.filter(s => s.estado === 'completado');
      const sesionesPendientes = sesionesCurso.filter(s => s.estado === 'pendiente');

      const maxEstudiantes = Math.max(...sesionesCompletadas.map(s => s.asistenciasRegistradas), 0);

      const totalPresentes = sesionesCompletadas.reduce((sum, s) => sum + s.asistenciasRegistradas, 0);

      const estimadoAusentes = Math.round(totalPresentes * 0.1);
      const estimadoPendientes = sesionesPendientes.length * (maxEstudiantes || 25);

      asignaturas.push({
        nombre: primerasesion.cursoNombre,
        clave: primerasesion.claveAsignatura || primerasesion.grupo,
        grupo: primerasesion.grupoNombre || 'Sin grupo',
        docente: primerasesion.docente,
        totalEstudiantes: maxEstudiantes || 25,
        presentes: totalPresentes,
        ausentes: estimadoAusentes,
        pendientes: estimadoPendientes
      });
    });

    return asignaturas.sort((a, b) => a.nombre.localeCompare(b.nombre));
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
