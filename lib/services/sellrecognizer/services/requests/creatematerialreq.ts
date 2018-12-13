import { UserInfo } from '../../shared/models/userinfo';

export interface CreateMaterialReq {
  ownerId: string;
  name: string;
  description: string;
  imageUrl: string;
  bluetooth: string;
  userInfo: UserInfo;
}
