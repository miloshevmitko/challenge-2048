export enum ShiftDirection {
  Down,
  Left,
  Right,
  Up,
}

export const ShiftDirectionMap = Object.values(ShiftDirection).filter(
  (value) => typeof value === "string"
);
