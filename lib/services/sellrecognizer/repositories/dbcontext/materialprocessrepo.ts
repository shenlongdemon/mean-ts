import {BaseMongo} from '../../../../repositories/mongo/basemongo';
import {Config} from './config';
import {MaterialProcess} from "../../shared/models";

class MaterialProcessRepo extends BaseMongo<MaterialProcess> {
  constructor() {
    super(Config.DB.URL, Config.DB.NAME, Config.COLlECTIONS.MATERIALPROCESSES);
  }
}

export default new MaterialProcessRepo();
