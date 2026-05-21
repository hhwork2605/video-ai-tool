import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { isSceneBusy, statusChipClass } from '../../../core/helpers';
import { ASPECT_RATIO_META, AspectRatio, Scene } from '../../../core/models';

/**
 * Card hiển thị + thao tác 1 scene. Pure presentation — emit event ra parent
 * khi user bấm gen image/video. Status chip class lấy từ helper chung.
 */
@Component({
  selector: 'app-scene-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './scene-card.component.html',
})
export class SceneCardComponent {
  readonly scene = input.required<Scene>();
  readonly aspectRatio = input.required<AspectRatio>();

  readonly genImage = output<Scene>();
  readonly genVideo = output<Scene>();

  readonly aspectMeta = computed(() => ASPECT_RATIO_META[this.aspectRatio()]);
  readonly busy = computed(() => isSceneBusy(this.scene().status));
  readonly chipClass = computed(() => statusChipClass(this.scene().status));
}
