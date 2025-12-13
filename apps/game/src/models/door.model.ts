import { z } from 'zod';

/** 표준 실내문 높이 (m) */
const STANDARD_DOOR_HEIGHT_M = 2.1;

export const doorSchema = z.object({
  id: z.string(),
  /** 벽 시작점 기준 문 중심 위치 (0~1) */
  position: z.number().min(0).max(1),
  /** 문 너비 (m) */
  width: z.number(),
  /** 문 높이 (m) */
  height: z.number().default(STANDARD_DOOR_HEIGHT_M),
});

export type Door = z.infer<typeof doorSchema>;
