import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
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
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './publish.page.html',
})
export class PublishPage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private state = inject(ProjectStateService);
  private snack = inject(MatSnackBar);

  readonly project = signal<Project | null>(null);
  readonly meta = computed<PublishMetadata | null>(
    () => this.project()?.publishMetadata ?? null
  );
  readonly loading = signal<boolean>(false);
  private projectId = '';

  readonly socials = [
    { label: 'TikTok', icon: 'music_note', url: 'https://www.tiktok.com/upload' },
    { label: 'Reels', icon: 'photo_camera', url: 'https://www.instagram.com/' },
    { label: 'Shorts', icon: 'play_circle', url: 'https://studio.youtube.com/' },
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
          this.snack.open(toErrorMessage(e, 'Không tải được project.'), 'Đóng', { duration: 4000 }),
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
        this.snack.open('Đã gen metadata mới', 'OK', { duration: 2000 });
      },
      error: (e) => {
        this.loading.set(false);
        this.snack.open(toErrorMessage(e, 'Lỗi khi gen metadata.'), 'Đóng', { duration: 4000 });
      },
    });
  }

  copy(text: string, label: string): void {
    navigator.clipboard.writeText(text);
    this.snack.open(`Đã copy ${label}`, undefined, { duration: 1500 });
  }

  copyHashtags(tags: string[]): void {
    navigator.clipboard.writeText(tags.map((h) => '#' + h).join(' '));
    this.snack.open('Đã copy hashtags', undefined, { duration: 1500 });
  }

  copyAll(m: PublishMetadata): void {
    const text = `${m.caption}\n\n${m.hashtags.map((h) => '#' + h).join(' ')}`;
    navigator.clipboard.writeText(text);
    this.snack.open('Đã copy caption + hashtag', undefined, { duration: 1500 });
  }

  download(): void {
    if (!this.project()?.finalVideoUrl) return;
    window.location.href = this.api.downloadFinalUrl(this.projectId);
  }

  back(): void {
    this.router.navigate(['/scenes', this.projectId]);
  }
}
