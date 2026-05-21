import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { StepsModule } from 'primeng/steps';
import { ProjectStage, STAGE_LABEL, STAGE_ORDER } from '../../core/models';

/**
 * PrimeNG p-steps làm visual progress indicator + navigation.
 * Click step header → router navigate. Pattern tương tự mat-stepper cũ.
 *
 * Responsive: <480px tự ẩn label qua SCSS, giữ chấm số.
 */
@Component({
  selector: 'app-wizard-stepper',
  standalone: true,
  imports: [CommonModule, StepsModule],
  templateUrl: './wizard-stepper.component.html',
  styleUrl: './wizard-stepper.component.scss',
})
export class WizardStepperComponent {
  private router = inject(Router);

  readonly current = input.required<ProjectStage>();
  readonly projectId = input.required<string>();

  readonly steps = STAGE_ORDER;
  readonly currentIndex = computed(() => this.steps.indexOf(this.current()));

  readonly items = computed<MenuItem[]>(() =>
    this.steps.map((stage) => ({
      label: STAGE_LABEL[stage],
    }))
  );

  onStepClick(index: number): void {
    const stage = this.steps[index];
    if (!stage) return;
    switch (stage) {
      case 'Ideation':
        this.router.navigate(['/idea']);
        break;
      case 'ScriptSelection':
        this.router.navigate(['/scripts', this.projectId()]);
        break;
      case 'SceneGeneration':
        this.router.navigate(['/scenes', this.projectId()]);
        break;
      case 'Publish':
        this.router.navigate(['/publish', this.projectId()]);
        break;
    }
  }
}
