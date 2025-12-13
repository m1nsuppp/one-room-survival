import { z } from 'zod';
import { wallSchema } from './wall.model';

export const roomSchema = z.object({
  width: z.number(),
  depth: z.number(),
  height: z.number(),
  walls: z.array(wallSchema),
});

export type Room = z.infer<typeof roomSchema>;
