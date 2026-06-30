import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GestionAsistenciasComponent } from './gestion-asistencias/gestion-asistencias.component';
import { SeguimientoRegistroComponent } from './seguimiento-registro/seguimiento-registro.component';
import { PrevencionAtencionComponent } from './prevencion-atencion/prevencion-atencion.component';
import { IntervencionColaborativaComponent } from './intervencion-colaborativa/intervencion-colaborativa.component';

@Component({
  selector: 'app-alerta-temprana',
  standalone: true,
  imports: [
    CommonModule,
    GestionAsistenciasComponent,
    SeguimientoRegistroComponent,
    PrevencionAtencionComponent,
    IntervencionColaborativaComponent
  ],
  templateUrl: './alerta-temprana.component.html',
  styleUrls: ['./alerta-temprana.component.css']
})
export class AlertaTempranaComponent {
  activeTab: string = 'gestion';

  tabs = [
    { id: 'gestion', label: 'Gestión de Asistencias' },
    { id: 'seguimiento', label: 'Seguimiento del Registro de Asistencia' },
    { id: 'prevencion', label: 'Prevención y Atención Focalizada' },
    { id: 'intervencion', label: 'Intervención Colaborativa' }
  ];

  constructor(private router: Router) {}

  selectTab(tabId: string): void {
    this.activeTab = tabId;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
