import {DynProperty} from "./dynproperty";

export interface ProcessStep {
  id: string;
  name: string;
  index: number;
  dynProperties: DynProperty[];
}
