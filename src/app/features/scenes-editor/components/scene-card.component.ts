import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import {
  isSceneBusy,
  sceneStatusIcon,
  sceneStatusSeverity,
} from '../../../core/helpers';
import { ASPECT_RATIO_META, AspectRatio, Scene } from '../../../core/models';

/**
 * Card hiển thị + thao tác 1 scene. PrimeNG p-card + p-tag + pTooltip.
 * Pure presentation — emit gen image/video ra parent.
 */
@Component({
  selector: 'app-scene-card',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, ButtonModule, TooltipModule],
  templateUrl: './scene-card.component.html',
})
export class SceneCardComponent {
  readonly scene = input.required<Scene>();
  readonly aspectRatio = input.required<AspectRatio>();

  readonly genImage = output<Scene>();
  readonly genVideo = output<Scene>();

  readonly aspectMeta = computed(() => ASPECT_RATIO_META[this.aspectRatio()]);
  readonly busy = computed(() => isSceneBusy(this.scene().status));
  readonly statusSeverity = computed(() => sceneStatusSeverity(this.scene().status));
  readonly statusIcon = computed(() => sceneStatusIcon(this.scene().status));
}
