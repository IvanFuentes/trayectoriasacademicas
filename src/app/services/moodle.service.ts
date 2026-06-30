import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Carrera {
  id: number;
  nombre: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  path: string;
  parent: number;
  hijos?: Categoria[];
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
  diasFaltas: number;
}

export interface EstudianteDetalle {
  id: number;
  nombre: string;
  matricula: string;
  email: string;
  carrera: string;
  diasFaltas: number;
  desgloseDias: DesgloseDia[];
}

export interface DesgloseDia {
  fecha: string;
  cursos: CursoFalta[];
}

export interface CursoFalta {
  curso: string;
  cursoId: number;
  docente: string;
}

@Injectable({
  providedIn: 'root'
})
export class MoodleService {
  private supabaseUrl = environment.supabaseUrl;
  private supabaseKey = environment.supabaseKey;
  private apiUrl = `${this.supabaseUrl}/functions/v1/moodle-data`;

  constructor(private http: HttpClient) {
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Supabase URL and anon key are required for Moodle API calls. Make sure src/environments/environment.ts is generated from .env.');
    }
  }

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

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}?action=categorias`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching categorias:', error);
        return throwError(() => error);
      })
    );
  }

  getCategoriasCursos(categoriaId: number): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiUrl}?action=categorias-cursos&categoria_id=${categoriaId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching categorias cursos:', error);
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

  getEstudianteDetalle(estudianteId: number, carreraId: number): Observable<EstudianteDetalle> {
    return this.http.get<EstudianteDetalle>(`${this.apiUrl}?action=estudiante-detalle&estudiante_id=${estudianteId}&carrera_id=${carreraId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching estudiante detalle:', error);
        return throwError(() => error);
      })
    );
  }
}
