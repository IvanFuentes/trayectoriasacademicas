import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Carrera {
  id: number;
  nombre: string;
}

export interface Curso {
  id: number;
  nombre: string;
  grupo: string;
  docente: string;
  docenteEmail: string;
  estado: 'configurado' | 'pendiente';
}

export interface SesionAsistencia {
  cursoId: number;
  cursoNombre: string;
  grupo: string;
  docente: string;
  sesionId: number;
  fecha: string;
  asistenciasRegistradas: number;
  estado: 'completado' | 'pendiente' | 'futuro';
}

export interface EstudianteFaltas {
  id: number;
  nombre: string;
  matricula: string;
  email: string;
  cursoNombre: string;
  cursoId: number;
  faltas: number;
}

@Injectable({
  providedIn: 'root'
})
export class MoodleService {
  private apiUrl = '/functions/v1/moodle-data';

  constructor(private http: HttpClient) {}

  getCarreras(): Observable<Carrera[]> {
    return this.http.get<Carrera[]>(`${this.apiUrl}?action=carreras`).pipe(
      catchError(error => {
        console.error('Error fetching carreras:', error);
        throw error;
      })
    );
  }

  getCursos(carreraId: number): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiUrl}?action=cursos&carrera_id=${carreraId}`).pipe(
      catchError(error => {
        console.error('Error fetching cursos:', error);
        throw error;
      })
    );
  }

  getSesionesAsistencia(carreraId: number): Observable<SesionAsistencia[]> {
    return this.http.get<SesionAsistencia[]>(`${this.apiUrl}?action=sesiones-asistencia&carrera_id=${carreraId}`).pipe(
      catchError(error => {
        console.error('Error fetching sesiones:', error);
        throw error;
      })
    );
  }

  getEstudiantesFaltas(carreraId: number): Observable<EstudianteFaltas[]> {
    return this.http.get<EstudianteFaltas[]>(`${this.apiUrl}?action=estudiantes-faltas&carrera_id=${carreraId}`).pipe(
      catchError(error => {
        console.error('Error fetching estudiantes con faltas:', error);
        throw error;
      })
    );
  }

  getDocentes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?action=docentes`).pipe(
      catchError(error => {
        console.error('Error fetching docentes:', error);
        throw error;
      })
    );
  }

  getAsistenciasConfig(cursoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?action=asistencias-config&curso_id=${cursoId}`).pipe(
      catchError(error => {
        console.error('Error checking attendance config:', error);
        throw error;
      })
    );
  }
}
