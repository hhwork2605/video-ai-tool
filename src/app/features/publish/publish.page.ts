import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { ApiService } from '../../core/api/api.service';
import { toErrorMessage } from '../../core/helpers';
import {
  ASPECT_RATIO_META,
  AspectRatio,
  Project,
  PublishMetadata,
} from '../../core/models';
import { ProjectStateService } from '../../core/state/project-state.service';

/**
 * Step 4 — Video preview + title/caption editable + hashtag chips + share.
 */
@Component({
  selector: 'page-publish',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ChipModule,
    DividerModule,
    FloatLabelModule,
    InputTextModule,
    TextareaModule,
    ProgressSpinnerModule,
    TooltipModule,
  ],
  templateUrl: './publish.page.html',
})
export class PublishPage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private state = inject(ProjectStateService);
  private msg = inject(MessageService);

  readonly project = signal<Project | null>(null);
  readonly meta = computed<PublishMetadata | null>(
    () => this.project()?.publishMetadata ?? null
  );
  readonly loading = signal<boolean>(false);
  private projectId = '';

  readonly socials = [
    { label: 'TikTok', icon: 'pi pi-tiktok', url: 'https://www.tiktok.com/upload' },
    { label: 'Reels', icon: 'pi pi-instagram', url: 'https://www.instagram.com/' },
    { label: 'Shorts', icon: 'pi pi-youtube', url: 'https://studio.youtube.com/' },
  ];

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.projectId) {
      this.router.navigate(['/idea']);
      return;
    }
    const cached = this.state.current();
    if (cached && cached.id === this.projectId) {
      this.project.set(cached);
    } else {
      this.api.getProject(this.projectId).subscribe({
        next: (p) => {
          this.state.set(p);
          this.project.set(p);
        },
        error: (e) =>
          this.msg.add({
            severity: 'error',
            summary: 'Không tải được project',
            detail: toErrorMessage(e, ''),
            life: 4000,
          }),
      });
    }
  }

  previewWrapClass() {
    const p = this.project();
    const r: AspectRatio = p?.aspectRatio ?? 'Vertical_9_16';
    const meta = ASPECT_RATIO_META[r];
    return {
      [meta.previewClass]: true,
      'max-w-[280px] sm:max-w-[360px]': r === 'Vertical_9_16',
      'max-w-[420px]': r === 'Square_1_1',
      'max-w-full': r === 'Horizontal_16_9',
    };
  }

  regenerate(): void {
    this.loading.set(true);
    this.api.generatePublishMetadata(this.projectId, 10).subscribe({
      next: (p) => {
        this.state.set(p);
        this.project.set(p);
        this.loading.set(false);
        this.msg.add({
          severity: 'success',
          summary: 'Đã gen metadata',
          life: 2000,
        });
      },
      error: (e) => {
        this.loading.set(false);
        this.msg.add({
          severity: 'error',
          summary: 'Lỗi gen metadata',
          detail: toErrorMessage(e, ''),
          life: 4000,
        });
      },
    });
  }

  copy(text: string, label: string): void {
    navigator.clipboard.writeText(text);
    this.msg.add({
      severity: 'success',
      summary: `Đã copy ${label}`,
      life: 1500,
    });
  }

  copyHashtags(tags: string[]): void {
    navigator.clipboard.writeText(tags.map((h) => '#' + h).join(' '));
    this.msg.add({ severity: 'success', summary: 'Đã copy hashtags', life: 1500 });
  }

  copyAll(m: PublishMetadata): void {
    const text = `${m.caption}\n\n${m.hashtags.map((h) => '#' + h).join(' ')}`;
    navigator.clipboard.writeText(text);
    this.msg.add({
      severity: 'success',
      summary: 'Đã copy caption + hashtag',
      life: 1500,
    });
  }

  download(): void {
    if (!this.project()?.finalVideoUrl) return;
    window.location.href = this.api.downloadFinalUrl(this.projectId);
  }

  back(): void {
    this.router.navigate(['/scenes', this.projectId]);
  }
}
