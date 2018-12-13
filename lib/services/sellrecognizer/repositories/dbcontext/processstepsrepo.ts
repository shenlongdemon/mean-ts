import { BaseMongo } from '../../../../repositories/mongo/basemongo';
import { Config } from './config';
import { ProcessStep } from '../../shared/models/processstep';
class ProcessStepsRepo extends BaseMongo<ProcessStep> {
  constructor() {
    super(Config.DB.URL, Config.DB.NAME, Config.COLlECTIONS.PROCESSSTEPS);
  }
}

export default new ProcessStepsRepo();
