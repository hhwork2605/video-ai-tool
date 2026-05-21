import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { TextareaModule } from 'primeng/textarea';
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
 * UI: PrimeNG Aura.
 */
@Component({
  selector: 'page-ideation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    SelectButtonModule,
    SliderModule,
    ButtonModule,
  ],
  templateUrl: './ideation.page.html',
})
export class IdeationPage {
  private api = inject(ApiService);
  private router = inject(Router);
  private state = inject(ProjectStateService);
  private msg = inject(MessageService);

  ideaText = '';
  audience = '';
  language = 'vi';

  // Raw 2-way ngModel cho PrimeNG (signal write từ ngModel hơi rườm).
  selectedAspect: AspectRatio = 'Vertical_9_16';
  durationModel = 30;
  candidateModel = 3;

  // Signal mirror chỉ dùng để hiển thị reactive trong template.
  readonly durationSec = signal<number>(30);
  readonly candidateCount = signal<number>(3);
  readonly loading = signal<boolean>(false);

  readonly languageOptions = [
    { label: 'Tiếng Việt', value: 'vi' },
    { label: 'English', value: 'en' },
  ];

  readonly aspectOptions = (Object.keys(ASPECT_RATIO_META) as AspectRatio[]).map(
    (k) => ({ value: k, ...ASPECT_RATIO_META[k] })
  );

  generate(): void {
    if (!this.ideaText.trim()) {
      this.msg.add({
        severity: 'warn',
        summary: 'Thiếu input',
        detail: 'Vui lòng nhập ý tưởng video.',
        life: 3000,
      });
      return;
    }
    this.loading.set(true);

    const body: GenerateScriptCandidatesRequest = {
      ideaText: this.ideaText.trim(),
      audience: this.audience?.trim() || null,
      language: this.language,
      targetDurationSec: this.durationSec(),
      aspectRatio: this.selectedAspect,
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
            this.msg.add({
              severity: 'error',
              summary: 'Lỗi gen kịch bản',
              detail: toErrorMessage(e, 'Thử lại sau.'),
              life: 5000,
            });
          },
        });
      },
      error: (e) => {
        this.loading.set(false);
        this.msg.add({
          severity: 'error',
          summary: 'Lỗi tạo project',
          detail: toErrorMessage(e, 'Thử lại sau.'),
          life: 5000,
        });
      },
    });
  }
}
