import { Utils } from '../../services';

export class TrilaterationPoint {
  public static getPointsInRange(
    a: TrilaterationPoint,
    b: TrilaterationPoint,
    roomName: string = '',
  ): TrilaterationPoint[] {
    const points: TrilaterationPoint[] = [];
    if (a.x > b.x || a.y > b.y || a.z > b.z) {
      throw new Error('Room Coordinates are not in order left-front-bottom to right-back-top');
    }
    for (let x = a.x; x <= b.x; x++) {
      for (let y = a.y; y <= b.y; y++) {
        for (let z = a.z; z <= b.z; z++) {
          points.push(new TrilaterationPoint(x, y, z, roomName));
        }
      }
    }
    return points;
  }

  public readonly coordinateName: string;

  constructor(
    public x: number,
    public y: number,
    public z: number,
    public roomName: string,
    public matchPoints: number = 0,
  ) {
    this.coordinateName = `${this.x}-${this.y}-${this.z}`;
  }

  public getDistance(other: TrilaterationPoint): number {
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2 + (this.z - other.z) ** 2);
  }

  public getDot5Distance(other: TrilaterationPoint): number {
    return Utils.roundDot5(this.getDistance(other));
  }
}