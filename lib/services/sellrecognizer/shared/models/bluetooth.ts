import {IObject} from "./iobject";

export interface Bluetooth extends IObject{
  name: string;
  localName: string;
  position: Position | null;
}