import { Carton } from '../models/carton';

export const getPickPos = (carton: Carton) => {
  if (carton.shelfOrder % 2 === 1) {
    return { x: carton.coordinate.x - 1, y: carton.coordinate.y };
  }

  return { x: carton.coordinate.x + 1, y: carton.coordinate.y };
};
