import {Position} from "./position";
import {Tracking} from "./tracking";

export interface LocationTracking {
  polygon: any | null; // current position
  trackings: Tracking[];
}