import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Sesion {
  fecha: string;
  estado: 'completado' | 'pendiente' | 'futuro';
}

interface CursoSeguimiento {
  nombre: string;
  grupo: string;
  docente: string;
  sesiones: Sesion[];
}

interface CarreraSeguimiento {
  id: string;
  nombre: string;
  cursos: CursoSeguimiento[];
}

@Component({
  selector: 'app-seguimiento-registro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seguimiento-registro.component.html',
  styleUrls: ['./seguimiento-registro.component.css']
})
export class SeguimientoRegistroComponent {
  carreras: CarreraSeguimiento[] = [
    {
      id: 'sistemas',
      nombre: 'Ingeniería en Sistemas Computacionales',
      cursos: [
        {
          nombre: 'Programación Orientada a Objetos',
          grupo: 'ISMA-2',
          docente: 'Juan Carlos Díaz López',
          sesiones: [
            { fecha: '2025-10-20', estado: 'completado' },
            { fecha: '2025-10-22', estado: 'completado' },
            { fecha: '2025-10-24', estado: 'pendiente' },
            { fecha: '2025-10-27', estado: 'pendiente' },
            { fecha: '2025-10-29', estado: 'futuro' }
          ]
        },
        {
          nombre: 'Administración de Base de Datos',
          grupo: 'ISMA-6',
          docente: 'Iván Humberto Fuentes Chab',
          sesiones: [
            { fecha: '2025-10-21', estado: 'completado' },
            { fecha: '2025-10-23', estado: 'completado' },
            { fecha: '2025-10-25', estado: 'completado' },
            { fecha: '2025-10-28', estado: 'futuro' }
          ]
        }
      ]
    },
    {
      id: 'ferroviaria',
      nombre: 'Ingeniería Ferroviaria',
      cursos: [
        {
          nombre: 'Sistemas de Señalización',
          grupo: 'IFMA-4',
          docente: 'Yesenia Nayrovick Hernández Montero',
          sesiones: [
            { fecha: '2025-10-19', estado: 'completado' },
            { fecha: '2025-10-21', estado: 'completado' },
            { fecha: '2025-10-23', estado: 'pendiente' },
            { fecha: '2025-10-26', estado: 'pendiente' }
          ]
        }
      ]
    },
    {
      id: 'animacion',
      nombre: 'Ingeniería en Animación Digital y Efectos Visuales',
      cursos: [
        {
          nombre: 'Modelado 3D',
          grupo: 'IAMA-4',
          docente: 'Damián Uriel Rosado Castellanos',
          sesiones: [
            { fecha: '2025-10-20', estado: 'completado' },
            { fecha: '2025-10-22', estado: 'completado' },
            { fecha: '2025-10-24', estado: 'completado' },
            { fecha: '2025-10-27', estado: 'futuro' }
          ]
        },
        {
          nombre: 'Animación de Personajes',
          grupo: 'IAMA-2',
          docente: 'Iván Humberto Fuentes Chab',
          sesiones: [
            { fecha: '2025-10-18', estado: 'pendiente' },
            { fecha: '2025-10-21', estado: 'pendiente' },
            { fecha: '2025-10-23', estado: 'pendiente' },
            { fecha: '2025-10-25', estado: 'pendiente' }
          ]
        }
      ]
    }
  ];

  selectedCarrera: string | null = null;

  selectCarrera(carreraId: string): void {
    this.selectedCarrera = this.selectedCarrera === carreraId ? null : carreraId;
  }

  getSelectedCarrera(): CarreraSeguimiento | undefined {
    return this.carreras.find(c => c.id === this.selectedCarrera);
  }

  getEstadoCount(sesiones: Sesion[], estado: string): number {
    return sesiones.filter(s => s.estado === estado).length;
  }
}
