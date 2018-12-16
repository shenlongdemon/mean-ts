import { BaseMongo } from '../../../../repositories/mongo/basemongo';
import { Config } from './config';
import {Item} from '../../shared/models';

class ItemRepo extends BaseMongo<Item> {
  constructor() {
    super(Config.DB.URL, Config.DB.NAME, Config.COLlECTIONS.ITEMS);
  }
}

export default new ItemRepo();
