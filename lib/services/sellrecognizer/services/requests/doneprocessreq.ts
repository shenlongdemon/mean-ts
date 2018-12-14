import {UserInfo} from "../../shared/models";

export interface DoneProcessReq {
  materialId: string;
  processId: string;
  userInfo: UserInfo;
}