import { z } from 'zod';

export const floorSchema = z.object({
  width: z.number(),
  depth: z.number(),
});

export type Floor = z.infer<typeof floorSchema>;
