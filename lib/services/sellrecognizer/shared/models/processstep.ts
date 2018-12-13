import {DynProperty} from "./dynproperty";

export interface ProcessStep {
  id: string;
  data: any;
  dynProperties: DynProperty[];
}
