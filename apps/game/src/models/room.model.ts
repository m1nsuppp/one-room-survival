import { z } from 'zod';
import { furnitureSchema } from './furniture.model';
import { wallSchema } from './wall.model';

export const roomSchema = z.object({
  width: z.number(),
  depth: z.number(),
  height: z.number(),
  walls: z.array(wallSchema),
  furnitures: z.array(furnitureSchema).default([]),
});

export type Room = z.infer<typeof roomSchema>;
