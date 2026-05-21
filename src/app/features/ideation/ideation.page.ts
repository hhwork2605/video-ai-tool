import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
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
 * Step 1 — Nhập idea + audience + language + aspect ratio + duration + count.
 * UI: PrimeNG Aura. Độ dài & số kịch bản dùng `p-select` (dropdown) thay vì
 * slider — preset cố định dễ chọn, giảm noise UI.
 *
 * Persistence: hydrate từ `state.current()` (project đã tạo) khi user back về
 * từ step 2/3. Nếu chưa có project thì fallback `state.ideationDraft()` để
 * giữ nội dung user đã gõ dở. Trên mỗi ngModelChange ta save draft.
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
    ButtonModule,
  ],
  templateUrl: './ideation.page.html',
})
export class IdeationPage implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private state = inject(ProjectStateService);
  private msg = inject(MessageService);

  ideaText = '';
  audience = '';
  language = 'vi';
  selectedAspect: AspectRatio = 'Vertical_9_16';
  durationModel = 30;
  candidateModel = 3;

  readonly loading = signal<boolean>(false);

  ngOnInit(): void {
    // Project hiện có thì ưu tiên (canonical) — case user back từ step 2/3.
    // Còn không thì lấy draft đã lưu.
    const project = this.state.current();
    const draft = this.state.ideationDraft();

    this.ideaText = project?.ideaText ?? draft.ideaText;
    this.audience = project?.audience ?? draft.audience;
    this.language = project?.language ?? draft.language;
    this.selectedAspect = project?.aspectRatio ?? draft.aspectRatio;
    this.durationModel = project?.targetDurationSec ?? draft.durationSec;
    // candidateCount đoán từ số candidate đã gen, fallback draft.
    this.candidateModel = project?.scriptCandidates?.length
      ? project.scriptCandidates.length
      : draft.candidateCount;
  }

  /** Lưu toàn bộ form hiện tại vào draft store. Gọi từ (ngModelChange). */
  saveDraft(): void {
    this.state.patchIdeationDraft({
      ideaText: this.ideaText,
      audience: this.audience,
      language: this.language,
      aspectRatio: this.selectedAspect,
      durationSec: this.durationModel,
      candidateCount: this.candidateModel,
    });
  }

  readonly languageOptions = [
    { label: 'Tiếng Việt', value: 'vi' },
    { label: 'English', value: 'en' },
  ];

  readonly aspectOptions = (Object.keys(ASPECT_RATIO_META) as AspectRatio[]).map(
    (k) => ({ value: k, ...ASPECT_RATIO_META[k] })
  );

  /** Lựa chọn độ dài video — bám theo chuẩn Reels/TikTok/Shorts. */
  readonly durationOptions = [
    { label: '15 giây — Hook ngắn', value: 15 },
    { label: '30 giây — Reels chuẩn', value: 30 },
    { label: '45 giây', value: 45 },
    { label: '60 giây — Tối đa TikTok cũ', value: 60 },
    { label: '90 giây', value: 90 },
    { label: '120 giây — Long-form', value: 120 },
  ];

  /** Số kịch bản AI gen song song — nhiều hơn = chọn lựa nhiều, cost cao hơn. */
  readonly candidateOptions = [
    { label: '1 kịch bản', value: 1 },
    { label: '2 kịch bản', value: 2 },
    { label: '3 kịch bản', value: 3 },
    { label: '4 kịch bản', value: 4 },
    { label: '5 kịch bản', value: 5 },
  ];

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
      targetDurationSec: this.durationModel,
      aspectRatio: this.selectedAspect,
      candidateCount: this.candidateModel,
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
