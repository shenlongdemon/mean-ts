import { BaseMongo } from '../../../../repositories/mongo/basemongo';
import { Config } from './config';
import { Material } from '../../shared/models';

class MaterialRepo extends BaseMongo<Material> {
  constructor() {
    super(Config.DB.URL, Config.DB.NAME, Config.COLlECTIONS.MATERIALS);
  }
}

export default new MaterialRepo();
