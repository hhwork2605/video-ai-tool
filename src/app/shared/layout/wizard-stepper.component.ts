import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { ProjectStage, STAGE_LABEL, STAGE_ORDER } from '../../core/models';

/**
 * Material stepper làm visual progress indicator + navigation.
 * Mỗi step gắn 1 route. Click step header → router navigate (chỉ cho phép
 * lùi về stage đã hoàn thành; bước tương lai vẫn cho click nếu user muốn skip
 * — backend sẽ reject nếu state chưa đủ).
 *
 * Responsive: labelPosition="bottom" để mobile co giãn được. Khi viewport < 480px,
 * mat-stepper tự ẩn label, chỉ giữ chấm số.
 */
@Component({
  selector: 'app-wizard-stepper',
  standalone: true,
  imports: [CommonModule, MatStepperModule],
  templateUrl: './wizard-stepper.component.html',
  styleUrl: './wizard-stepper.component.scss',
})
export class WizardStepperComponent {
  private router = inject(Router);

  readonly current = input.required<ProjectStage>();
  readonly projectId = input.required<string>();

  readonly steps = STAGE_ORDER;
  readonly labels = STAGE_LABEL;
  readonly currentIndex = computed(() => this.steps.indexOf(this.current()));

  private routeFor(stage: ProjectStage): string[] {
    switch (stage) {
      case 'Ideation':
        return ['/idea'];
      case 'ScriptSelection':
        return ['/scripts', this.projectId()];
      case 'SceneGeneration':
        return ['/scenes', this.projectId()];
      case 'Publish':
        return ['/publish', this.projectId()];
    }
  }

  onStep(e: StepperSelectionEvent): void {
    const stage = this.steps[e.selectedIndex];
    if (!stage) return;
    this.router.navigate(this.routeFor(stage));
  }
}
