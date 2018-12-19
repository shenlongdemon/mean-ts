import {DynProperty} from "../../shared/models";

export interface UpdateProcessDynPropertiesReq {
  materialId: string;
  processId: string;
  properties: DynProperty[];
}