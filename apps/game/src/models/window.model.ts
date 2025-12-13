import { z } from 'zod';

/** 창문이 벽의 어느 위치에 있는지 (0~1 비율) */
export const windowSchema = z.object({
  id: z.string(),
  /** 벽 시작점 기준 창문 중심 위치 (0~1) */
  position: z.number().min(0).max(1),
  /** 창문 너비 (m) */
  width: z.number(),
  /** 창문 높이 (m) */
  height: z.number(),
  /** 바닥에서 창문 하단까지 높이 (m) */
  sillHeight: z.number().default(0.9),
});

export type Window = z.infer<typeof windowSchema>;
