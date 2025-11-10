import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoodleService, Carrera, Curso } from '../../services/moodle.service';

interface CarreraData {
  id: number;
  nombre: string;
  cursos: Curso[];
  loading?: boolean;
  error?: string;
}

@Component({
  selector: 'app-gestion-asistencias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-asistencias.component.html',
  styleUrls: ['./gestion-asistencias.component.css']
})
export class GestionAsistenciasComponent implements OnInit {
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
          cursos: [],
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
      this.loadCursos(carreraId);
    }
  }

  loadCursos(carreraId: number): void {
    const carrera = this.carreras.find(c => c.id === carreraId);
    if (carrera) {
      carrera.loading = true;

      this.moodleService.getCursos(carreraId).subscribe({
        next: (cursos: Curso[]) => {
          carrera.cursos = cursos;
          carrera.loading = false;
        },
        error: (error) => {
          console.error('Error loading cursos:', error);
          carrera.error = 'Error al cargar los cursos';
          carrera.loading = false;
        }
      });
    }
  }

  getSelectedCarrera(): CarreraData | undefined {
    return this.carreras.find(c => c.id === this.selectedCarrera);
  }
}
