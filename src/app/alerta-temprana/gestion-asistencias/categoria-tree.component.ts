import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoodleService, Curso } from '../../services/moodle.service';

interface CategoriaNode {
  id: number;
  nombre: string;
  path: string;
  parent: number;
  hijos?: CategoriaNode[];
  cursos?: Curso[];
  loading?: boolean;
  expanded?: boolean;
}

@Component({
  selector: 'app-categoria-tree',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="categoria-item" [class.expanded]="categoria.expanded">
      <button
        class="categoria-button"
        [style.padding-left.px]="getIndent()"
        (click)="toggleCategoria()"
      >
        <span class="categoria-nombre">{{ categoria.nombre }}</span>
        <span class="categoria-icon" *ngIf="hasContent()">
          {{ categoria.expanded ? '−' : '+' }}
        </span>
      </button>

      <div class="contenido" *ngIf="categoria.expanded">
        <div *ngIf="categoria.loading" class="loading-message">
          Cargando...
        </div>

        <div *ngIf="!categoria.loading && categoria.hijos && categoria.hijos.length > 0" class="subcategorias">
          <ng-container *ngFor="let hijo of categoria.hijos">
            <app-categoria-tree [categoria]="hijo" [moodleService]="moodleService" [nivel]="nivel + 1"></app-categoria-tree>
          </ng-container>
        </div>

        <div *ngIf="!categoria.loading && categoria.cursos && categoria.cursos.length > 0" class="cursos-table">
          <div class="table-header">
            <div class="header-cell">Curso</div>
            <div class="header-cell">Grupo</div>
            <div class="header-cell">Clave</div>
            <div class="header-cell">Docente</div>
            <div class="header-cell">Estado</div>
          </div>

          <div class="table-body">
            <div
              *ngFor="let curso of categoria.cursos"
              class="table-row"
            >
              <div class="table-cell">{{ curso.nombre }}</div>
              <div class="table-cell">{{ curso.grupo }}</div>
              <div class="table-cell">{{ curso.clave }}</div>
              <div class="table-cell">{{ curso.docente }}</div>
              <div class="table-cell">
                <span
                  class="estado-badge"
                  [class.configurado]="curso.estado === 'configurado'"
                  [class.pendiente]="curso.estado === 'pendiente'"
                >
                  {{ curso.estado === 'configurado' ? 'Configurado' : 'Pendiente de Configuración' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!categoria.loading && (!categoria.cursos || categoria.cursos.length === 0) && (!categoria.hijos || categoria.hijos.length === 0)" class="empty-message">
          No hay contenido disponible
        </div>
      </div>
    </div>
  `,
  styles: [`
    .categoria-item {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      margin-bottom: 12px;
    }

    .categoria-item.expanded {
      border-color: #8ba8bc;
      box-shadow: 0 4px 12px rgba(107, 143, 163, 0.15);
    }

    .categoria-button {
      width: 100%;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e8eef2 100%);
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .categoria-button:hover {
      background: linear-gradient(135deg, #e8eef2 0%, #d4dfe8 100%);
    }

    .categoria-nombre {
      text-align: left;
      flex: 1;
    }

    .categoria-icon {
      font-size: 20px;
      font-weight: bold;
      color: #6b8fa3;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 6px;
      margin-left: 12px;
    }

    .contenido {
      padding: 20px 24px;
      background: white;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .subcategorias {
      margin-bottom: 16px;
    }

    .loading-message {
      padding: 12px;
      background: #e8eef2;
      border-radius: 8px;
      color: #6b8fa3;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      margin-bottom: 12px;
    }

    .empty-message {
      padding: 16px;
      text-align: center;
      color: #64748b;
      font-size: 13px;
    }

    .cursos-table {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 12px;
    }

    .table-header {
      display: grid;
      grid-template-columns: 3fr 1.2fr 1.2fr 2fr 1.8fr;
      background: linear-gradient(135deg, #6b8fa3 0%, #8ba8bc 100%);
      font-weight: 600;
      color: white;
    }

    .header-cell {
      padding: 12px;
      font-size: 13px;
    }

    .table-body {
      background: white;
    }

    .table-row {
      display: grid;
      grid-template-columns: 3fr 1.2fr 1.2fr 2fr 1.8fr;
      border-bottom: 1px solid #e2e8f0;
      transition: background 0.2s ease;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-row:hover {
      background: #f8fafc;
    }

    .table-cell {
      padding: 12px;
      font-size: 13px;
      color: #1a1a1a;
      display: flex;
      align-items: center;
    }

    .estado-badge {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
    }

    .estado-badge.configurado {
      background: #d1fae5;
      color: #065f46;
    }

    .estado-badge.pendiente {
      background: #fee2e2;
      color: #991b1b;
    }

    @media (max-width: 1024px) {
      .table-header,
      .table-row {
        grid-template-columns: 1.5fr 0.8fr 1.5fr 1.2fr;
      }

      .header-cell,
      .table-cell {
        padding: 10px;
        font-size: 12px;
      }
    }
  `]
})
export class CategoriaTreeComponent {
  @Input() categoria!: CategoriaNode;
  @Input() moodleService!: MoodleService;
  @Input() nivel: number = 0;

  toggleCategoria(): void {
    this.categoria.expanded = !this.categoria.expanded;

    if (this.categoria.expanded && this.shouldLoadCursos()) {
      this.loadCursos();
    }
  }

  shouldLoadCursos(): boolean {
    return !this.categoria.cursos &&
           (!this.categoria.hijos || this.categoria.hijos.length === 0);
  }

  loadCursos(): void {
    this.categoria.loading = true;

    this.moodleService.getCategoriasCursos(this.categoria.id).subscribe({
      next: (cursos) => {
        this.categoria.cursos = cursos;
        this.categoria.loading = false;
      },
      error: (error) => {
        console.error('Error loading cursos:', error);
        this.categoria.loading = false;
      }
    });
  }

  hasContent(): boolean {
    const hasHijos = this.categoria.hijos && this.categoria.hijos.length > 0;
    const hasCursos = this.categoria.cursos && this.categoria.cursos.length > 0;
    return !!(hasHijos || hasCursos);
  }

  getIndent(): number {
    return this.nivel * 24;
  }
}
