import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoodleService, Carrera, EstudianteFaltas, EstudianteDetalle } from '../../services/moodle.service';

interface CarreraData {
  id: number;
  nombre: string;
  estudiantes: EstudianteFaltas[];
  loading?: boolean;
  error?: string;
}

@Component({
  selector: 'app-prevencion-atencion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prevencion-atencion.component.html',
  styleUrls: ['./prevencion-atencion.component.css']
})
export class PrevencionAtencionComponent implements OnInit {
  carreras: CarreraData[] = [];
  selectedCarrera: number | null = null;
  selectedEstudiante: EstudianteDetalle | null = null;
  showModal: boolean = false;
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
          estudiantes: [],
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
      this.loadEstudiantes(carreraId);
    }
  }

  loadEstudiantes(carreraId: number): void {
    const carrera = this.carreras.find(c => c.id === carreraId);
    if (carrera) {
      carrera.loading = true;

      this.moodleService.getEstudiantesFaltas(carreraId).subscribe({
        next: (estudiantes: EstudianteFaltas[]) => {
          carrera.estudiantes = estudiantes;
          carrera.loading = false;
        },
        error: (error) => {
          console.error('Error loading estudiantes:', error);
          carrera.error = 'Error al cargar estudiantes con faltas';
          carrera.loading = false;
        }
      });
    }
  }

  getSelectedCarrera(): CarreraData | undefined {
    return this.carreras.find(c => c.id === this.selectedCarrera);
  }

  getFaltasClass(faltas: number): string {
    if (faltas >= 5) return 'critico';
    if (faltas >= 3) return 'advertencia';
    return 'alerta';
  }

  openModal(estudiante: EstudianteFaltas): void {
    if (!this.selectedCarrera) return;

    this.moodleService.getEstudianteDetalle(estudiante.id, this.selectedCarrera).subscribe({
      next: (detalle: EstudianteDetalle) => {
        this.selectedEstudiante = detalle;
        this.showModal = true;
      },
      error: (error) => {
        console.error('Error loading estudiante detalle:', error);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedEstudiante = null;
  }

  generarReporte(): void {
    console.log('Generando reporte para:', this.selectedEstudiante);
    alert('Funcionalidad de reporte en desarrollo');
  }
}
