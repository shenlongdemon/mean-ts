import { BaseMongo } from '../../../../repositories/mongo/basemongo';
import { Config } from './config';
import {Category} from '../../shared/models';

class CategoryRepo extends BaseMongo<Category> {
  constructor() {
    super(Config.DB.URL, Config.DB.NAME, Config.COLlECTIONS.CATEGORIES);
  }
}

export default new CategoryRepo();
