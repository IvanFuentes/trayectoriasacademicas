import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Curso {
  nombre: string;
  grupo: string;
  docente: string;
  estado: 'configurado' | 'pendiente';
}

interface Carrera {
  id: string;
  nombre: string;
  cursos: Curso[];
}

@Component({
  selector: 'app-gestion-asistencias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-asistencias.component.html',
  styleUrls: ['./gestion-asistencias.component.css']
})
export class GestionAsistenciasComponent {
  carreras: Carrera[] = [
    {
      id: 'sistemas',
      nombre: 'Ingeniería en Sistemas Computacionales',
      cursos: [
        {
          nombre: 'Programación Orientada a Objetos',
          grupo: 'ISMA-2',
          docente: 'Juan Carlos Díaz López',
          estado: 'configurado'
        },
        {
          nombre: 'Administración de Base de Datos',
          grupo: 'ISMA-6',
          docente: 'Iván Humberto Fuentes Chab',
          estado: 'configurado'
        },
        {
          nombre: 'Programación Web',
          grupo: 'ISMA-6',
          docente: 'Juan Carlos Díaz López',
          estado: 'pendiente'
        },
        {
          nombre: 'Redes de Computadoras',
          grupo: 'S7A',
          docente: 'Hesiquio Zarate Landa',
          estado: 'configurado'
        }
      ]
    },
    {
      id: 'ferroviaria',
      nombre: 'Ingeniería Ferroviaria',
      cursos: [
        {
          nombre: 'Sistemas de Señalización',
          grupo: 'IFMA-6',
          docente: 'Yesenia Nayrovick Hernández Montero',
          estado: 'configurado'
        },
        {
          nombre: 'Infraestructura Ferroviaria',
          grupo: 'IFMA-2',
          docente: 'Yesenia Nayrovick Hernández Montero',
          estado: 'pendiente'
        },
        {
          nombre: 'Material Rodante',
          grupo: 'IFMA-4',
          docente: 'Diego Zarate Sánchez',
          estado: 'configurado'
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
          estado: 'configurado'
        },
        {
          nombre: 'Animación de Personajes',
          grupo: 'IAMA-2',
          docente: 'Iván Humberto Fuentes Chab',
          estado: 'pendiente'
        },
        {
          nombre: 'Efectos Visuales',
          grupo: 'IAMA-6',
          docente: 'Ing. Fernando Ortiz Luna',
          estado: 'configurado'
        },
        {
          nombre: 'Francisco Kantún',
          grupo: 'IAMA-6',
          docente: 'Francisco Kantún',
          estado: 'pendiente'
        }
      ]
    }
  ];

  selectedCarrera: string | null = null;

  selectCarrera(carreraId: string): void {
    this.selectedCarrera = this.selectedCarrera === carreraId ? null : carreraId;
  }

  getSelectedCarrera(): Carrera | undefined {
    return this.carreras.find(c => c.id === this.selectedCarrera);
  }
}
