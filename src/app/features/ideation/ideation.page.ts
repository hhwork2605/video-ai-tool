import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api/api.service';
import { toErrorMessage } from '../../core/helpers';
import {
  ASPECT_RATIO_META,
  AspectRatio,
  GenerateScriptCandidatesRequest,
} from '../../core/models';
import { ProjectStateService } from '../../core/state/project-state.service';

/**
 * Step 1 — Nhập idea + audience + language + aspect ratio + slider count.
 */
@Component({
  selector: 'page-ideation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './ideation.page.html',
})
export class IdeationPage {
  private api = inject(ApiService);
  private router = inject(Router);
  private state = inject(ProjectStateService);
  private snack = inject(MatSnackBar);

  ideaText = '';
  audience = '';
  language = 'vi';

  readonly aspectRatio = signal<AspectRatio>('Vertical_9_16');
  readonly durationSec = signal<number>(30);
  readonly candidateCount = signal<number>(3);
  readonly loading = signal<boolean>(false);

  readonly aspectOptions = (Object.keys(ASPECT_RATIO_META) as AspectRatio[]).map(
    (k) => ({ value: k, ...ASPECT_RATIO_META[k] })
  );

  generate(): void {
    if (!this.ideaText.trim()) {
      this.snack.open('Vui lòng nhập ý tưởng video.', 'OK', { duration: 3000 });
      return;
    }
    this.loading.set(true);

    const body: GenerateScriptCandidatesRequest = {
      ideaText: this.ideaText.trim(),
      audience: this.audience?.trim() || null,
      language: this.language,
      targetDurationSec: this.durationSec(),
      aspectRatio: this.aspectRatio(),
      candidateCount: this.candidateCount(),
    };

    this.api.createProject().subscribe({
      next: (project) => {
        this.api.generateScripts(project.id, body).subscribe({
          next: (full) => {
            this.state.set(full);
            this.loading.set(false);
            this.router.navigate(['/scripts', full.id]);
          },
          error: (e) => {
            this.loading.set(false);
            this.snack.open(toErrorMessage(e, 'Lỗi khi gen kịch bản.'), 'Đóng', {
              duration: 5000,
            });
          },
        });
      },
      error: (e) => {
        this.loading.set(false);
        this.snack.open(toErrorMessage(e, 'Lỗi khi tạo project.'), 'Đóng', {
          duration: 5000,
        });
      },
    });
  }
}
