import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ScriptCandidate } from '../../../core/models';

/**
 * Card hiển thị 1 ScriptCandidate. Pure presentation — parent quản lý selected
 * state, click bằng wrapper div ở parent.
 */
@Component({
  selector: 'app-candidate-card',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule],
  templateUrl: './candidate-card.component.html',
})
export class CandidateCardComponent {
  readonly candidate = input.required<ScriptCandidate>();
  readonly selected = input<boolean>(false);
}
