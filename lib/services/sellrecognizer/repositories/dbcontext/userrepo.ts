import { BaseMongo } from '../../../../repositories/mongo/basemongo';
import { Config } from './config';
import { User } from '../../shared/models';
class UserRepo extends BaseMongo<User> {
  constructor() {
    super(Config.DB.URL, Config.DB.NAME, Config.COLlECTIONS.USERS);
  }
}

export default new UserRepo();
