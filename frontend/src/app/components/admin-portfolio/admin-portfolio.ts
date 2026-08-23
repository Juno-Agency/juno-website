import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';
import {
  PortfolioDraft,
  PortfolioItem,
  emptyPortfolioDraft,
  toPortfolioDraft,
} from '../../models/portfolio.model';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Back-office CRUD for portfolio projects, with R2 image upload. */
@Component({
  selector: 'app-admin-portfolio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-portfolio.html',
  styleUrl: './admin-portfolio.scss',
})
export class AdminPortfolioComponent implements OnInit {
  private readonly api = inject(PortfolioService);

  protected readonly items = signal<PortfolioItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly editorOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly draft = signal<PortfolioDraft>(emptyPortfolioDraft());
  protected readonly tagsText = signal('');
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly uploadErr = signal('');
  protected readonly confirmDeleteId = signal<string | null>(null);

  protected readonly isEditing = computed(() => this.editingId() !== null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.api.listAll().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les projets.');
        this.loading.set(false);
      },
    });
  }

  protected patch(part: Partial<PortfolioDraft>): void {
    this.draft.update((d) => ({ ...d, ...part }));
  }

  protected openNew(): void {
    this.draft.set(emptyPortfolioDraft());
    this.tagsText.set('');
    this.editingId.set(null);
    this.uploadErr.set('');
    this.error.set('');
    this.editorOpen.set(true);
  }

  protected openEdit(item: PortfolioItem): void {
    this.draft.set(toPortfolioDraft(item));
    this.tagsText.set(item.tags.join(', '));
    this.editingId.set(item.id);
    this.uploadErr.set('');
    this.error.set('');
    this.editorOpen.set(true);
  }

  protected close(): void {
    this.editorOpen.set(false);
    this.confirmDeleteId.set(null);
  }

  protected onImagePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadErr.set('');
    if (!file.type.startsWith('image/')) {
      this.uploadErr.set('Fichier non image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.uploadErr.set('Image trop lourde (max 8 Mo).');
      return;
    }
    this.uploading.set(true);
    this.api.uploadImage(file).subscribe({
      next: ({ url, key }) => {
        this.patch({ imageUrl: url, imageKey: key });
        this.uploading.set(false);
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadErr.set(
          err?.status === 503 ? 'Stockage non configuré côté serveur.' : 'Échec de l’upload.',
        );
      },
    });
  }

  protected save(): void {
    if (this.saving()) return;
    const d = this.draft();
    if (!d.title.trim()) {
      this.error.set('Le titre est obligatoire.');
      return;
    }
    const payload: PortfolioDraft = {
      ...d,
      title: d.title.trim(),
      tags: this.tagsText()
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    this.saving.set(true);
    this.error.set('');
    const id = this.editingId();
    const req = id ? this.api.update(id, payload) : this.api.create(payload);
    req.subscribe({
      next: (item) => {
        this.items.update((list) =>
          id ? list.map((p) => (p.id === item.id ? item : p)) : [...list, item],
        );
        this.saving.set(false);
        this.close();
        this.load(); // re-sort by order server-side
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Échec de l’enregistrement.');
      },
    });
  }

  protected askDelete(id: string): void {
    this.confirmDeleteId.set(id);
  }
  protected cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }
  protected doDelete(id: string): void {
    this.api.remove(id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((p) => p.id !== id));
        this.confirmDeleteId.set(null);
        if (this.editingId() === id) this.close();
      },
      error: () => this.error.set('Échec de la suppression.'),
    });
  }
}
