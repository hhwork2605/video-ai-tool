import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ProjectStateService } from '../../core/state/project-state.service';
import { WizardStepperComponent } from './wizard-stepper.component';

/**
 * Layout: p-toolbar sticky + WizardStepper + router-outlet + global p-toast + footer.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    ToolbarModule,
    ToastModule,
    WizardStepperComponent,
  ],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  readonly state = inject(ProjectStateService);
  readonly year = new Date().getFullYear();
}
