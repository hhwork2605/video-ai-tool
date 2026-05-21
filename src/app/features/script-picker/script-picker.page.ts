import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api/api.service';
import { toErrorMessage } from '../../core/helpers';
import { ScriptCandidate } from '../../core/models';
import { ProjectStateService } from '../../core/state/project-state.service';
import { CandidateCardComponent } from './components/candidate-card.component';

/**
 * Step 2 — Grid card N candidates, sticky action bar khi đã chọn.
 */
@Component({
  selector: 'page-script-picker',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CandidateCardComponent,
  ],
  templateUrl: './script-picker.page.html',
})
export class ScriptPickerPage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private state = inject(ProjectStateService);
  private snack = inject(MatSnackBar);

  readonly loading = signal<boolean>(true);
  readonly confirming = signal<boolean>(false);
  readonly selectedId = signal<string | null>(null);
  readonly candidates = signal<ScriptCandidate[]>([]);
  readonly selectedCandidate = computed(() =>
    this.candidates().find((c) => c.id === this.selectedId()) ?? null
  );

  private projectId = '';

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.projectId) {
      this.router.navigate(['/idea']);
      return;
    }
    const cached = this.state.current();
    if (cached && cached.id === this.projectId) {
      this.candidates.set(cached.scriptCandidates);
      this.loading.set(false);
    } else {
      this.api.getProject(this.projectId).subscribe({
        next: (p) => {
          this.state.set(p);
          this.candidates.set(p.scriptCandidates);
          this.loading.set(false);
        },
        error: (e) => {
          this.loading.set(false);
          this.snack.open(toErrorMessage(e, 'Không tải được project.'), 'Đóng', {
            duration: 4000,
          });
        },
      });
    }
  }

  confirm(): void {
    const id = this.selectedId();
    if (!id) return;
    this.confirming.set(true);
    this.api.selectCandidate(this.projectId, id).subscribe({
      next: (p) => {
        this.state.set(p);
        this.confirming.set(false);
        this.router.navigate(['/scenes', p.id]);
      },
      error: (e) => {
        this.confirming.set(false);
        this.snack.open(toErrorMessage(e, 'Lỗi khi chọn kịch bản.'), 'Đóng', {
          duration: 4000,
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/idea']);
  }
}
