import {Position} from "./position";

export interface Tracking extends Position{
  ownerId: string;
  time: number;
}