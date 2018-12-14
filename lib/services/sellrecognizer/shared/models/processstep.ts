import {DynProperty} from "./dynproperty";
import {IObject} from "./iobject";

export interface ProcessStep extends IObject {
  name: string;
  index: number;
  dynProperties: DynProperty[];
}
