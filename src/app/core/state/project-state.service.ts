import { Injectable, computed, signal } from '@angular/core';
import { AspectRatio, Project } from '../models';

/**
 * Form draft của Step 1 — Ideation. Giữ tách khỏi `Project` vì user có thể
 * gõ dở dang rồi rời trang TRƯỚC khi gọi API tạo project. Khi project tồn tại,
 * IdeationPage ưu tiên hydrate từ `current` (canonical) và fallback về draft.
 */
export interface IdeationDraft {
  ideaText: string;
  audience: string;
  language: string;
  aspectRatio: AspectRatio;
  durationSec: number;
  candidateCount: number;
}

const DEFAULT_IDEATION_DRAFT: IdeationDraft = {
  ideaText: '',
  audience: '',
  language: 'vi',
  aspectRatio: 'Vertical_9_16',
  durationSec: 30,
  candidateCount: 3,
};

/**
 * State store gọn cho project hiện tại. Page component đọc qua `current()` signal,
 * cập nhật qua `set()`. Pattern tương tự facade NgRx ở mhql-hotel-v2 nhưng dùng
 * signal vì scope FE nhỏ — không cần Store/Effects.
 */
@Injectable({ providedIn: 'root' })
export class ProjectStateService {
  private _current = signal<Project | null>(null);
  readonly current = this._current.asReadonly();

  private _ideationDraft = signal<IdeationDraft>(DEFAULT_IDEATION_DRAFT);
  readonly ideationDraft = this._ideationDraft.asReadonly();

  readonly stage = computed(() => this._current()?.stage ?? 'Ideation');
  readonly hasProject = computed(() => this._current() !== null);

  set(project: Project): void {
    this._current.set(project);
  }

  patchIdeationDraft(patch: Partial<IdeationDraft>): void {
    this._ideationDraft.update((d) => ({ ...d, ...patch }));
  }

  clear(): void {
    this._current.set(null);
    this._ideationDraft.set(DEFAULT_IDEATION_DRAFT);
  }
}
