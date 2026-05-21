export type AspectRatio = 'Vertical_9_16' | 'Square_1_1' | 'Horizontal_16_9';

export const ASPECT_RATIO_META: Record<
  AspectRatio,
  { label: string; ratio: string; previewClass: string }
> = {
  Vertical_9_16: {
    label: 'Vertical 9:16',
    ratio: '9 / 16',
    previewClass: 'aspect-[9/16]',
  },
  Square_1_1: {
    label: 'Square 1:1',
    ratio: '1 / 1',
    previewClass: 'aspect-square',
  },
  Horizontal_16_9: {
    label: 'Landscape 16:9',
    ratio: '16 / 9',
    previewClass: 'aspect-video',
  },
};
