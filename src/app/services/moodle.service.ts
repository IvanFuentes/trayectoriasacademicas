import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Carrera {
  id: number;
  nombre: string;
}

export interface Curso {
  id: number;
  nombre: string;
  clave: string;
  grupo: string;
  docente: string;
  docenteEmail: string;
  estado: 'configurado' | 'pendiente';
}

export interface SesionAsistencia {
  cursoId: number;
  cursoNombre: string;
  grupo: string;
  grupoNombre?: string;
  claveAsignatura?: string;
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
  private supabaseUrl = 'https://yxuzeeblexqpjfmnfxhy.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dXplZWJsZXhxcGpmbW5meGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NDA0MzcsImV4cCI6MjA3ODMxNjQzN30.3ljtL7SzH-M0vDsQn-FgvdWyS1Ze-Mqzn2pnVFunsIY';
  private apiUrl = `${this.supabaseUrl}/functions/v1/moodle-data`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.supabaseKey}`,
      'apikey': this.supabaseKey
    });
  }

  getCarreras(): Observable<Carrera[]> {
    return this.http.get<Carrera[]>(`${this.apiUrl}?action=carreras`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching carreras:', error);
        return throwError(() => error);
      })
    );
  }

  getCursos(carreraId: number): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiUrl}?action=cursos&carrera_id=${carreraId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching cursos:', error);
        return throwError(() => error);
      })
    );
  }

  getSesionesAsistencia(carreraId: number): Observable<SesionAsistencia[]> {
    return this.http.get<SesionAsistencia[]>(`${this.apiUrl}?action=sesiones-asistencia&carrera_id=${carreraId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching sesiones:', error);
        return throwError(() => error);
      })
    );
  }

  getEstudiantesFaltas(carreraId: number): Observable<EstudianteFaltas[]> {
    return this.http.get<EstudianteFaltas[]>(`${this.apiUrl}?action=estudiantes-faltas&carrera_id=${carreraId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching estudiantes con faltas:', error);
        return throwError(() => error);
      })
    );
  }

  getDocentes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?action=docentes`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching docentes:', error);
        return throwError(() => error);
      })
    );
  }

  getAsistenciasConfig(cursoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?action=asistencias-config&curso_id=${cursoId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error checking attendance config:', error);
        return throwError(() => error);
      })
    );
  }
}
