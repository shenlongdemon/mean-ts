import { UserInfo } from '../../shared/models/userinfo';
import {Bluetooth} from "../../shared/models";

export interface CreateMaterialReq {
  name: string;
  description: string;
  imageUrl: string;
  bluetooth: Bluetooth | null;
  owner: UserInfo;
}
