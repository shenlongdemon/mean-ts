import {UserInfo} from "../../shared/models";

export interface AddActivityReq {
  materialId: string;
  processId: string;
  title: string;
  description: string;
  image: string;
  file: string;
  userInfo: UserInfo;
}