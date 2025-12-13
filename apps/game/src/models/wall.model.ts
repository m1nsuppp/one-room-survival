import { z } from 'zod';

export const wallSide = z.enum(['north', 'south', 'east', 'west']);

export const position2d = z.object({
  x: z.number(),
  z: z.number(),
});

export const wallSchema = z.object({
  id: z.string(),
  side: wallSide,
  start: position2d,
  end: position2d,
  thickness: z.number().default(0.1),
});

export type WallSide = z.infer<typeof wallSide>;
export type Position2D = z.infer<typeof position2d>;
export type Wall = z.infer<typeof wallSchema>;
