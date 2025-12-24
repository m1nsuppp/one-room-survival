/** 그리드 크기 (10cm) */
export const GRID_SIZE = 0.1;

/** 값을 그리드에 스냅 */
export function snapToGrid(value: number, gridSize: number = GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize;
}

/** x, z 좌표를 그리드에 스냅 */
export function snapPositionToGrid(
  x: number,
  z: number,
  gridSize: number = GRID_SIZE
): { x: number; z: number } {
  return {
    x: snapToGrid(x, gridSize),
    z: snapToGrid(z, gridSize),
  };
}
