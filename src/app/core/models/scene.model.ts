export type SceneStatus =
  | 'Pending'
  | 'PromptReady'
  | 'ImageGenerating'
  | 'ImageDone'
  | 'VideoGenerating'
  | 'VideoDone'
  | 'Failed';

/** Bản nháp 1 scene trong ScriptCandidate trước khi user chọn. */
export interface SceneDraft {
  index: number;
  voiceOver: string;
  visualHint: string;
  suggestedDurationSec: number;
}

/** Scene chính thức sau khi user chọn candidate. */
export interface Scene {
  index: number;
  voiceOver: string;
  visualHint: string;
  imagePromptEn?: string | null;
  motionPrompt?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  durationSec: number;
  status: SceneStatus;
  errorMessage?: string | null;
  costUsd: number;
}
