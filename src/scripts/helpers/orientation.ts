import { Facings } from "./constants"

export const getFacing = (x: number, y: number) => {
  if (x === -1) {
    if (y === -1) {
      return Facings.NORTH_WEST;
    } else if (y === 1) {
      return Facings.SOUTH_WEST;
    }
    // y === 0
    return Facings.WEST;
  } else if (x === 1) {
    if (y === -1) {
      return Facings.NORTH_EAST;
    } else if (y === 1) {
      return Facings.SOUTH_EAST;
    }
    // y === 0
    return Facings.EAST;
  }

  if (y === -1) {
    return Facings.NORTH;
  } else if (y === 1) {
    return Facings.SOUTH;
  }

  // x === 0, y === 0
  return Facings.SOUTH;
}