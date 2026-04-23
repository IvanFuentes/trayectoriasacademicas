import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoodleService, Carrera, Curso, Categoria } from '../../services/moodle.service';
import { CategoriaTreeComponent } from './categoria-tree.component';

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
  selector: 'app-gestion-asistencias',
  standalone: true,
  imports: [CommonModule, CategoriaTreeComponent],
  templateUrl: './gestion-asistencias.component.html',
  styleUrls: ['./gestion-asistencias.component.css']
})
export class GestionAsistenciasComponent implements OnInit {
  categorias: CategoriaNode[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  moodleService: MoodleService;

  constructor(moodleService: MoodleService) {
    this.moodleService = moodleService;
  }

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.moodleService.getCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = this.transformToNodes(categorias);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categorias:', error);
        this.errorMessage = 'Error al cargar las categorías. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  transformToNodes(categorias: Categoria[]): CategoriaNode[] {
    return categorias.map(cat => ({
      id: cat.id,
      nombre: cat.nombre,
      path: cat.path,
      parent: cat.parent,
      hijos: cat.hijos ? this.transformToNodes(cat.hijos) : [],
      expanded: false
    }));
  }

  toggleCategoria(categoria: CategoriaNode): void {
    categoria.expanded = !categoria.expanded;
    if (categoria.expanded && categoria.hijos && categoria.hijos.length === 0 && !categoria.cursos) {
      this.loadCursosPorCategoria(categoria);
    }
  }

  loadCursosPorCategoria(categoria: CategoriaNode): void {
    categoria.loading = true;

    this.moodleService.getCategoriasCursos(categoria.id).subscribe({
      next: (cursos: Curso[]) => {
        categoria.cursos = cursos;
        categoria.loading = false;
      },
      error: (error) => {
        console.error('Error loading cursos:', error);
        categoria.loading = false;
      }
    });
  }
}
