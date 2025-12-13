import { z } from 'zod';
import { wallSchema } from './wall.model';

/** 한국 주거용 건축물 표준 천장 높이 (m) */
const STANDARD_CEILING_HEIGHT_M = 2.4;

export const roomSchema = z.object({
  width: z.number(),
  depth: z.number(),
  height: z.number().default(STANDARD_CEILING_HEIGHT_M),
  walls: z.array(wallSchema),
});

export type Room = z.infer<typeof roomSchema>;
