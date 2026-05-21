import { AspectRatio } from './aspect-ratio';
import { SceneDraft } from './scene.model';

export interface ScriptCandidate {
  id: string;
  title: string;
  hook: string;
  tone: string;
  estimatedDurationSec: number;
  scenes: SceneDraft[];
}

/** Body cho POST /api/ideas/{projectId}/scripts. */
export interface GenerateScriptCandidatesRequest {
  ideaText: string;
  audience?: string | null;
  language?: string;
  targetDurationSec: number;
  aspectRatio: AspectRatio;
  candidateCount: number;
}
