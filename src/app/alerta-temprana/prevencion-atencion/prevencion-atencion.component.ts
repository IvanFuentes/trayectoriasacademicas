import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Estudiante {
  id: string;
  nombre: string;
  matricula: string;
  carrera: string;
  email: string;
  curso: string;
  faltas: number;
}

interface CarreraPrevencion {
  id: string;
  nombre: string;
  estudiantes: Estudiante[];
}

@Component({
  selector: 'app-prevencion-atencion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prevencion-atencion.component.html',
  styleUrls: ['./prevencion-atencion.component.css']
})
export class PrevencionAtencionComponent {
  carreras: CarreraPrevencion[] = [
    {
      id: 'sistemas',
      nombre: 'Ingeniería en Sistemas Computacionales',
      estudiantes: [
        {
          id: '1',
          nombre: 'Ana María González Pérez',
          matricula: '120204010',
          carrera: 'Ingeniería en Sistemas Computacionales',
          email: 'ana.gonzalez@escarcega.tecnm.mx',
          curso: 'Programación Orientada a Objetos',
          faltas: 2
        },
        {
          id: '2',
          nombre: 'Carlos Alberto Martínez López',
          matricula: 'S20005678',
          carrera: 'Ingeniería en Sistemas Computacionales',
          email: 'carlos.martinez@itssnp.edu.mx',
          curso: 'Administración de Base de Datos',
          faltas: 4
        },
        {
          id: '3',
          nombre: 'María Elena Ramírez Torres',
          matricula: 'S21002345',
          carrera: 'Ingeniería en Sistemas Computacionales',
          email: 'maria.ramirez@itssnp.edu.mx',
          curso: 'Programación Web',
          faltas: 6
        }
      ]
    },
    {
      id: 'ferroviaria',
      nombre: 'Ingeniería Ferroviaria',
      estudiantes: [
        {
          id: '4',
          nombre: 'José Luis Hernández García',
          matricula: 'F21003456',
          carrera: 'Ingeniería Ferroviaria',
          email: 'jose.hernandez@itssnp.edu.mx',
          curso: 'Sistemas de Señalización',
          faltas: 3
        },
        {
          id: '5',
          nombre: 'Laura Patricia Sánchez Ruiz',
          matricula: 'F20007890',
          carrera: 'Ingeniería Ferroviaria',
          email: 'laura.sanchez@itssnp.edu.mx',
          curso: 'Infraestructura Ferroviaria',
          faltas: 7
        }
      ]
    },
    {
      id: 'animacion',
      nombre: 'Ingeniería en Animación Digital y Efectos Visuales',
      estudiantes: [
        {
          id: '6',
          nombre: 'Diego Fernando Morales Castro',
          matricula: 'A21004567',
          carrera: 'Ingeniería en Animación Digital y Efectos Visuales',
          email: 'diego.morales@itssnp.edu.mx',
          curso: 'Modelado 3D',
          faltas: 1
        },
        {
          id: '7',
          nombre: 'Carmen Beatriz Torres Díaz',
          matricula: 'A20008901',
          carrera: 'Ingeniería en Animación Digital y Efectos Visuales',
          email: 'carmen.torres@itssnp.edu.mx',
          curso: 'Animación de Personajes',
          faltas: 5
        },
        {
          id: '8',
          nombre: 'Roberto Alejandro Flores Vega',
          matricula: 'A21005678',
          carrera: 'Ingeniería en Animación Digital y Efectos Visuales',
          email: 'roberto.flores@itssnp.edu.mx',
          curso: 'Efectos Visuales',
          faltas: 8
        }
      ]
    }
  ];

  selectedCarrera: string | null = null;
  selectedEstudiante: Estudiante | null = null;
  showModal: boolean = false;

  selectCarrera(carreraId: string): void {
    this.selectedCarrera = this.selectedCarrera === carreraId ? null : carreraId;
  }

  getSelectedCarrera(): CarreraPrevencion | undefined {
    return this.carreras.find(c => c.id === this.selectedCarrera);
  }

  getFaltasClass(faltas: number): string {
    if (faltas >= 5) return 'critico';
    if (faltas >= 3) return 'advertencia';
    return 'alerta';
  }

  openModal(estudiante: Estudiante): void {
    this.selectedEstudiante = estudiante;
    this.showModal = true;
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
