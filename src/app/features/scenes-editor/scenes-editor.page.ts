import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api/api.service';
import { estimateCost, toErrorMessage } from '../../core/helpers';
import {
  ASPECT_RATIO_META,
  AspectRatio,
  Scene,
} from '../../core/models';
import { ProgressService } from '../../core/realtime/progress.service';
import { ProjectStateService } from '../../core/state/project-state.service';
import { SceneCardComponent } from './components/scene-card.component';

/**
 * Step 3 — Grid scene card; bulk gen prompts/images/videos; render & navigate.
 */
@Component({
  selector: 'page-scenes-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    SceneCardComponent,
  ],
  templateUrl: './scenes-editor.page.html',
})
export class ScenesEditorPage implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private state = inject(ProjectStateService);
  private progress = inject(ProgressService);
  private snack = inject(MatSnackBar);

  readonly scenes = computed<Scene[]>(() => this.state.current()?.scenes ?? []);
  readonly aspectRatio = computed<AspectRatio>(
    () => this.state.current()?.aspectRatio ?? 'Vertical_9_16'
  );
  readonly aspectMeta = computed(() => ASPECT_RATIO_META[this.aspectRatio()]);

  readonly rendering = signal(false);
  readonly busyBuildPrompts = signal(false);
  readonly busyAllImages = signal(false);
  readonly busyAllVideos = signal(false);

  readonly estimatedCost = computed(() => estimateCost(this.scenes()));

  readonly allHavePrompts = computed(
    () => this.scenes().length > 0 && this.scenes().every((s) => !!s.imagePromptEn)
  );
  readonly allHaveImages = computed(
    () => this.scenes().length > 0 && this.scenes().every((s) => !!s.imageUrl)
  );
  readonly allHaveVideos = computed(
    () => this.scenes().length > 0 && this.scenes().every((s) => !!s.videoUrl)
  );

  private projectId = '';

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.projectId) {
      this.router.navigate(['/idea']);
      return;
    }

    const cached = this.state.current();
    if (!cached || cached.id !== this.projectId) {
      this.api.getProject(this.projectId).subscribe({
        next: (p) => {
          this.state.set(p);
          this.connectProgress();
        },
        error: (e) =>
          this.snack.open(toErrorMessage(e, 'Không tải được project.'), 'Đóng', { duration: 4000 }),
      });
    } else {
      this.connectProgress();
    }
  }

  ngOnDestroy(): void {
    void this.progress.disconnect();
  }

  private connectProgress(): void {
    this.progress.connect(this.projectId).catch((e) =>
      this.snack.open(`SignalR connect lỗi: ${e}`, 'Đóng', { duration: 4000 })
    );
  }

  buildPrompts(): void {
    this.busyBuildPrompts.set(true);
    this.api.buildPrompts(this.projectId).subscribe({
      next: (p) => {
        this.state.set(p);
        this.busyBuildPrompts.set(false);
        this.snack.open('Đã build prompt cho mọi scene.', 'OK', { duration: 2000 });
      },
      error: (e) => {
        this.busyBuildPrompts.set(false);
        this.snack.open(toErrorMessage(e, 'Build prompts lỗi.'), 'Đóng', { duration: 4000 });
      },
    });
  }

  genImage(scene: Scene): void {
    this.api.genImage(this.projectId, scene.index).subscribe({
      next: (updated) => {
        this.patchScene(updated);
      },
      error: (e) =>
        this.snack.open(
          toErrorMessage(e, `Gen ảnh scene ${scene.index + 1} lỗi.`),
          'Đóng',
          { duration: 4000 }
        ),
    });
  }

  genAllImages(): void {
    this.busyAllImages.set(true);
    this.api.genImagesAll(this.projectId).subscribe({
      next: (p) => {
        this.state.set(p);
        this.busyAllImages.set(false);
      },
      error: (e) => {
        this.busyAllImages.set(false);
        this.snack.open(toErrorMessage(e, 'Gen all images lỗi.'), 'Đóng', { duration: 4000 });
      },
    });
  }

  genVideo(scene: Scene): void {
    this.api.genVideo(this.projectId, scene.index).subscribe({
      next: () =>
        this.snack.open(`Đã queue gen video scene ${scene.index + 1}.`, 'OK', { duration: 2000 }),
      error: (e) =>
        this.snack.open(toErrorMessage(e, 'Queue gen video lỗi.'), 'Đóng', { duration: 4000 }),
    });
  }

  genAllVideos(): void {
    if (!confirm(`Gen video cho ${this.scenes().length} scene. Cost ước tính ${this.estimatedCost()}. Tiếp tục?`)) {
      return;
    }
    this.busyAllVideos.set(true);
    this.api.genVideosAll(this.projectId).subscribe({
      next: () => {
        this.busyAllVideos.set(false);
        this.snack.open('Đã queue gen all videos. Theo dõi progress trên từng card.', 'OK', {
          duration: 3000,
        });
      },
      error: (e) => {
        this.busyAllVideos.set(false);
        this.snack.open(toErrorMessage(e, 'Gen all videos lỗi.'), 'Đóng', { duration: 4000 });
      },
    });
  }

  renderAndGoPublish(): void {
    this.rendering.set(true);
    this.api.renderProject(this.projectId).subscribe({
      next: (p) => {
        this.state.set(p);
        this.rendering.set(false);
        this.router.navigate(['/publish', this.projectId]);
      },
      error: (e) => {
        this.rendering.set(false);
        const msg = toErrorMessage(e, 'Chưa thể render — chuyển sang Publish để xem metadata.');
        this.snack.open(msg, 'OK', { duration: 5000 });
        this.router.navigate(['/publish', this.projectId]);
      },
    });
  }

  back(): void {
    this.router.navigate(['/scripts', this.projectId]);
  }

  private patchScene(updated: Scene): void {
    const project = this.state.current();
    if (!project) return;
    const scenes = project.scenes.map((s) => (s.index === updated.index ? updated : s));
    this.state.set({ ...project, scenes });
  }
}
