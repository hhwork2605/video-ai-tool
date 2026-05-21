import { SceneStatus } from '../models';

/**
 * Map SceneStatus → Tailwind class cho mat-chip (kèm `!` prefix override Material).
 * Dùng chung cho mọi nơi hiển thị status badge.
 */
export function statusChipClass(status: SceneStatus): string {
  switch (status) {
    case 'ImageGenerating':
    case 'VideoGenerating':
      return '!bg-amber-100 !text-amber-800 animate-pulse';
    case 'ImageDone':
    case 'VideoDone':
      return '!bg-emerald-100 !text-emerald-800';
    case 'PromptReady':
      return '!bg-blue-100 !text-blue-700';
    case 'Failed':
      return '!bg-red-100 !text-red-700';
    default:
      return '!bg-slate-200 !text-slate-700';
  }
}

/** True khi scene đang trong quá trình generate (animating). */
export function isSceneBusy(status: SceneStatus): boolean {
  return status === 'ImageGenerating' || status === 'VideoGenerating';
}
