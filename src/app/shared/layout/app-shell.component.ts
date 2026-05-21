import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ProjectStateService } from '../../core/state/project-state.service';
import { WizardStepperComponent } from './wizard-stepper.component';

/**
 * Layout: mat-toolbar sticky + WizardStepper + router-outlet + footer.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    WizardStepperComponent,
  ],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  readonly state = inject(ProjectStateService);
  readonly year = new Date().getFullYear();
}
