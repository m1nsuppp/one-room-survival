export interface CollisionFeedback {
  type: 'collision';
  message: string;
  collidingIds: string[];
}

export interface BoundaryFeedback {
  type: 'boundary';
  message: string;
  furnitureId: string;
}

export interface PathwayFeedback {
  type: 'pathway';
  message: string;
  from: string;
  to: string;
}

export interface WindowBlockageFeedback {
  type: 'windowBlockage';
  message: string;
  windowId: string;
  blockageRatio: number;
  requiredClearanceRatio: number;
}

export type ValidationFeedback =
  | CollisionFeedback
  | BoundaryFeedback
  | PathwayFeedback
  | WindowBlockageFeedback;

const FEEDBACK_TYPES: string[] = ['collision', 'boundary', 'pathway', 'windowBlockage'];

export function isValidationFeedback(
  value: unknown
): value is ValidationFeedback {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('type' in value)) {
    return false;
  }

  const obj = value as { type: unknown };

  return typeof obj.type === 'string' && FEEDBACK_TYPES.includes(obj.type);
}
