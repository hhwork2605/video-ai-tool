import { Injectable, computed, signal } from '@angular/core';
import { Project } from '../models';

/**
 * State store gọn cho project hiện tại. Page component đọc qua `current()` signal,
 * cập nhật qua `set()`. Pattern tương tự facade NgRx ở mhql-hotel-v2 nhưng dùng
 * signal vì scope FE nhỏ — không cần Store/Effects.
 */
@Injectable({ providedIn: 'root' })
export class ProjectStateService {
  private _current = signal<Project | null>(null);
  readonly current = this._current.asReadonly();

  readonly stage = computed(() => this._current()?.stage ?? 'Ideation');
  readonly hasProject = computed(() => this._current() !== null);

  set(project: Project): void {
    this._current.set(project);
  }

  clear(): void {
    this._current.set(null);
  }
}
