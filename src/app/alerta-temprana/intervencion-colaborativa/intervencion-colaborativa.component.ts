import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FactoresRiesgo {
  academico: string[];
  economico: string[];
  personal: string[];
}

@Component({
  selector: 'app-intervencion-colaborativa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './intervencion-colaborativa.component.html',
  styleUrls: ['./intervencion-colaborativa.component.css']
})
export class IntervencionColaborativaComponent {
  formData = {
    nombreEstudiante: '',
    matricula: '',
    carrera: '',
    factoresAcademico: [] as string[],
    factoresEconomico: [] as string[],
    factoresPersonal: [] as string[],
    descripcionSituacion: '',
    nivelAlerta: 1
  };

  factoresDisponibles = {
    academico: [
      'Insatisfacción académica',
      'Conflictos con docentes',
      'Bajo rendimiento escolar'
    ],
    economico: [
      'Dificultad de transporte',
      'Necesidad de actividad laboral'
    ],
    personal: [
      'Acoso escolar',
      'Maternidad o paternidad',
      'Familiar',
      'Salud física',
      'Salud emocional'
    ]
  };

  carreras = [
    'Ingeniería en Sistemas Computacionales',
    'Ingeniería Ferroviaria',
    'Ingeniería en Animación Digital y Efectos Visuales'
  ];

  toggleFactor(categoria: 'academico' | 'economico' | 'personal', factor: string): void {
    const array = this.formData[`factores${categoria.charAt(0).toUpperCase() + categoria.slice(1)}` as keyof typeof this.formData] as string[];
    const index = array.indexOf(factor);

    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(factor);
    }
  }

  isFActorSelected(categoria: 'academico' | 'economico' | 'personal', factor: string): boolean {
    const array = this.formData[`factores${categoria.charAt(0).toUpperCase() + categoria.slice(1)}` as keyof typeof this.formData] as string[];
    return array.includes(factor);
  }

  getNivelAlertaClass(): string {
    if (this.formData.nivelAlerta >= 8) return 'terciaria';
    if (this.formData.nivelAlerta >= 4) return 'secundaria';
    return 'primaria';
  }

  onSubmit(): void {
    console.log('Formulario enviado:', this.formData);
    alert('Reporte de intervención registrado correctamente');
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      nombreEstudiante: '',
      matricula: '',
      carrera: '',
      factoresAcademico: [],
      factoresEconomico: [],
      factoresPersonal: [],
      descripcionSituacion: '',
      nivelAlerta: 1
    };
  }
}
