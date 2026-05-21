import { SceneStatus } from '../models';

/**
 * Map SceneStatus → severity của PrimeNG p-tag.
 * Severity values: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'.
 */
export function sceneStatusSeverity(
  status: SceneStatus
): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
  switch (status) {
    case 'ImageGenerating':
    case 'VideoGenerating':
      return 'warn';
    case 'ImageDone':
    case 'VideoDone':
      return 'success';
    case 'PromptReady':
      return 'info';
    case 'Failed':
      return 'danger';
    default:
      return 'secondary';
  }
}

/** Icon PrimeIcons phù hợp với status (hiển thị bên trong p-tag). */
export function sceneStatusIcon(status: SceneStatus): string {
  switch (status) {
    case 'ImageGenerating':
    case 'VideoGenerating':
      return 'pi pi-spin pi-spinner';
    case 'ImageDone':
      return 'pi pi-image';
    case 'VideoDone':
      return 'pi pi-check-circle';
    case 'PromptReady':
      return 'pi pi-pen-to-square';
    case 'Failed':
      return 'pi pi-times-circle';
    default:
      return 'pi pi-clock';
  }
}

/** True khi scene đang trong quá trình generate (animating). */
export function isSceneBusy(status: SceneStatus): boolean {
  return status === 'ImageGenerating' || status === 'VideoGenerating';
}
