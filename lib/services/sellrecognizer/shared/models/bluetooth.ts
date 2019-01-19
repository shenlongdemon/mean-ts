import {IObject} from "./iobject";
import {Position} from "./position";

export interface Bluetooth extends IObject{
  mac: string;
  name: string;
  proximityUUID: string;
  position: Position | null;
}