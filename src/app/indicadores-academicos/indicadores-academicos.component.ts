import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IndicadoresDesercionComponent } from './indicadores-desercion/indicadores-desercion.component';
import { IndicadoresAprobacionComponent } from './indicadores-aprobacion/indicadores-aprobacion.component';
import { IndicadoresEficienciaTerminalComponent } from './indicadores-eficiencia-terminal/indicadores-eficiencia-terminal.component';

@Component({
  selector: 'app-indicadores-academicos',
  standalone: true,
  imports: [
    CommonModule,
    IndicadoresDesercionComponent,
    IndicadoresAprobacionComponent,
    IndicadoresEficienciaTerminalComponent
  ],
  templateUrl: './indicadores-academicos.component.html',
  styleUrls: ['./indicadores-academicos.component.css']
})
export class IndicadoresAcademicosComponent {
  activeTab: string = 'desercion';

  tabs = [
    { id: 'desercion', label: 'Indicadores de Deserción' },
    { id: 'aprobacion', label: 'Indicadores de Aprobación' },
    { id: 'eficiencia', label: 'Indicadores de Eficiencia Terminal' }
  ];

  constructor(private router: Router) {}

  selectTab(tabId: string): void {
    this.activeTab = tabId;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
