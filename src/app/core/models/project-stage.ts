export type ProjectStage =
  | 'Ideation'
  | 'ScriptSelection'
  | 'SceneGeneration'
  | 'Publish';

export const STAGE_ORDER: ProjectStage[] = [
  'Ideation',
  'ScriptSelection',
  'SceneGeneration',
  'Publish',
];

export const STAGE_LABEL: Record<ProjectStage, string> = {
  Ideation: 'Ý tưởng',
  ScriptSelection: 'Chọn kịch bản',
  SceneGeneration: 'Tạo ảnh & video',
  Publish: 'Đăng bài',
};
