import {UserInfo} from "../../shared/models";

export interface AddMaintainReq {
  itemId: string;
  title: string;
  description: string;
  image: string;
  file: string;
  userInfo: UserInfo;
}