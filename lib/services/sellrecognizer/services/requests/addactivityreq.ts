import {Activity} from "../../shared/models";

export interface AddActivityReq {
  materialId: string;
  processId: string;
  activity: Activity
}