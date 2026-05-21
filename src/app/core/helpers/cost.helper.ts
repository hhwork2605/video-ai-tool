import { Scene } from '../models';

/** Giá ước tính per call của provider real (khi swap khỏi stub). */
const IMAGE_COST_PER_SCENE_USD = 0.03; // Gemini 2.5 Flash Image
const VIDEO_COST_PER_SECOND_USD = 0.4; // Veo 3

/**
 * Ước tính cost tổng để gen ảnh + video cho 1 list scenes.
 * Trả về string đã format "$X.XX" để hiển thị trực tiếp lên UI.
 */
export function estimateCost(scenes: Scene[]): string {
  const imageCost = scenes.length * IMAGE_COST_PER_SCENE_USD;
  const videoCost = scenes.reduce(
    (acc, s) => acc + s.durationSec * VIDEO_COST_PER_SECOND_USD,
    0
  );
  return `$${(imageCost + videoCost).toFixed(2)}`;
}
