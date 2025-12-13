import { z } from 'zod';

export const furnitureType = z.enum(['bed', 'desk', 'chair', 'closet', 'refrigerator', 'washer']);

export const rotation = z.enum(['0', '90', '180', '270']);

export const furnitureSchema = z.object({
  id: z.string(),
  type: furnitureType,
  /** 가구 너비 (m) - x축 */
  width: z.number(),
  /** 가구 깊이 (m) - z축 */
  depth: z.number(),
  /** 가구 높이 (m) - y축 */
  height: z.number(),
  /** 위치 x (m) - 가구 중심 기준 */
  x: z.number(),
  /** 위치 z (m) - 가구 중심 기준 */
  z: z.number(),
  /** 회전 (도) */
  rotation: rotation.default('0'),
});

export type FurnitureType = z.infer<typeof furnitureType>;
export type Rotation = z.infer<typeof rotation>;
export type Furniture = z.infer<typeof furnitureSchema>;
