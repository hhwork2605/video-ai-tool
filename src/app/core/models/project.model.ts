import { AspectRatio } from './aspect-ratio';
import { ProjectStage } from './project-stage';
import { PublishMetadata } from './publish.model';
import { Scene } from './scene.model';
import { ScriptCandidate } from './script.model';

/** Aggregate root mirror ProjectDto của backend. */
export interface Project {
  id: string;
  createdAt: string;
  name?: string | null;
  stage: ProjectStage;
  ideaText?: string | null;
  audience?: string | null;
  language: string;
  targetDurationSec: number;
  aspectRatio: AspectRatio;
  scriptCandidates: ScriptCandidate[];
  selectedCandidateId?: string | null;
  scenes: Scene[];
  finalVideoUrl?: string | null;
  publishMetadata?: PublishMetadata | null;
  totalCostUsd: number;
}
