import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoodleService, Carrera, Curso, Categoria } from '../../services/moodle.service';

interface CategoriaNode {
  id: number;
  nombre: string;
  path: string;
  parent: number;
  subcategorias?: CategoriaNode[];
  cursos?: Curso[];
  loading?: boolean;
  expanded?: boolean;
}

interface CarreraData {
  id: number;
  nombre: string;
  cursos: Curso[];
  loading?: boolean;
  error?: string;
}

@Component({
  selector: 'app-gestion-asistencias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-asistencias.component.html',
  styleUrls: ['./gestion-asistencias.component.css']
})
export class GestionAsistenciasComponent implements OnInit {
  categorias: CategoriaNode[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private moodleService: MoodleService) {}

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.moodleService.getCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = this.buildCategoryTree(categorias);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categorias:', error);
        this.errorMessage = 'Error al cargar las categorías. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  buildCategoryTree(categorias: Categoria[]): CategoriaNode[] {
    const categoryMap = new Map<number, CategoriaNode>();

    categorias.forEach(cat => {
      categoryMap.set(cat.id, {
        id: cat.id,
        nombre: cat.nombre,
        path: cat.path,
        parent: cat.parent,
        subcategorias: [],
        expanded: false
      });
    });

    const roots: CategoriaNode[] = [];
    categorias.forEach(cat => {
      const node = categoryMap.get(cat.id)!;
      if (cat.parent === 0) {
        roots.push(node);
      }
    });

    return roots.sort((a, b) => a.id - b.id);
  }

  toggleCategoria(categoria: CategoriaNode): void {
    categoria.expanded = !categoria.expanded;
    if (categoria.expanded && !categoria.cursos) {
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
