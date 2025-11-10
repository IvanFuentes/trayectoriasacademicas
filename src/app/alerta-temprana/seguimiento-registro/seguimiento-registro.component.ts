import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoodleService, Carrera, SesionAsistencia } from '../../services/moodle.service';

interface CarreraData {
  id: number;
  nombre: string;
  sesiones: SesionAsistencia[];
  loading?: boolean;
  error?: string;
}

interface SesionAgrupada {
  cursoId: number;
  cursoNombre: string;
  grupoNombre: string;
  claveAsignatura: string;
  docente: string;
  sesiones: SesionAsistencia[];
}

@Component({
  selector: 'app-seguimiento-registro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seguimiento-registro.component.html',
  styleUrls: ['./seguimiento-registro.component.css']
})
export class SeguimientoRegistroComponent implements OnInit {
  carreras: CarreraData[] = [];
  selectedCarrera: number | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private moodleService: MoodleService) {}

  ngOnInit(): void {
    this.loadCarreras();
  }

  loadCarreras(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.moodleService.getCarreras().subscribe({
      next: (carreras: Carrera[]) => {
        this.carreras = carreras.map(carrera => ({
          id: carrera.id,
          nombre: carrera.nombre,
          sesiones: [],
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

  selectCarrera(carreraId: number): void {
    if (this.selectedCarrera === carreraId) {
      this.selectedCarrera = null;
    } else {
      this.selectedCarrera = carreraId;
      this.loadSesiones(carreraId);
    }
  }

  loadSesiones(carreraId: number): void {
    const carrera = this.carreras.find(c => c.id === carreraId);
    if (carrera) {
      carrera.loading = true;

      this.moodleService.getSesionesAsistencia(carreraId).subscribe({
        next: (sesiones: SesionAsistencia[]) => {
          carrera.sesiones = sesiones;
          carrera.loading = false;
        },
        error: (error) => {
          console.error('Error loading sesiones:', error);
          carrera.error = 'Error al cargar las sesiones de asistencia';
          carrera.loading = false;
        }
      });
    }
  }

  getSelectedCarrera(): CarreraData | undefined {
    return this.carreras.find(c => c.id === this.selectedCarrera);
  }

  agruparSesiones(sesiones: SesionAsistencia[]): SesionAgrupada[] {
    const agrupado = new Map<number, SesionAgrupada>();

    sesiones.forEach(sesion => {
      const key = sesion.cursoId;
      if (!agrupado.has(key)) {
        agrupado.set(key, {
          cursoId: sesion.cursoId,
          cursoNombre: sesion.cursoNombre,
          grupoNombre: sesion.grupoNombre || 'Sin grupo',
          claveAsignatura: sesion.claveAsignatura || sesion.grupo,
          docente: sesion.docente,
          sesiones: []
        });
      }
      agrupado.get(key)!.sesiones.push(sesion);
    });

    return Array.from(agrupado.values());
  }

  getEstadoCount(sesiones: SesionAsistencia[], estado: string): number {
    return sesiones.filter(s => s.estado === estado).length;
  }
}
