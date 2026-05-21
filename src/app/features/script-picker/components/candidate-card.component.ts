import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ScriptCandidate } from '../../../core/models';

/**
 * Card hiển thị 1 ScriptCandidate. Clickable từ parent (parent quản lý selected
 * state). Component này pure presentation — không inject service.
 */
@Component({
  selector: 'app-candidate-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule],
  templateUrl: './candidate-card.component.html',
})
export class CandidateCardComponent {
  readonly candidate = input.required<ScriptCandidate>();
  readonly selected = input<boolean>(false);
}
