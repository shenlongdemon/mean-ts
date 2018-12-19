import {BaseService} from './baseservice';
import {
  AddActivityReq,
  AssignWorkerReq,
  CreateMaterialReq,
  DoneProcessReq,
  LoginReq,
  SaveMaterialProcessReq,
  UpdateProcessField,
  UpdateProcessInfoReq
} from './requests';
import sellRepo from '../repositories/sellrecognizerrepo';
import {BusErr} from '../../models/buserr';
import {CONSTANTS, DateUtil} from '../../commons';
import {BUS_ERR_CODE} from './commons/errorcode';
import {
  Category,
  DynProperty,
  Item,
  Material,
  MaterialProcess,
  Process,
  ProcessStatus,
  ProcessStep,
  TransactionAction,
  User,
  UserInfo
} from "../shared/models";
import {CreateItemReq} from "./requests/createitemreq";
import {UpdateProcessDynPropertiesReq} from "./requests/UpdateProcessDynPropertiesReq";

const uuid = require('uuid');

class SellRecognizer extends BaseService {
  
  constructor() {
    super();
  }
  
  login = async (req: LoginReq): Promise<User> => {
    const user: User | null = await sellRepo.getUserForLogin(req.phone, req.password);
    if (!user) {
      throw new BusErr(BUS_ERR_CODE.WRONG_LOGIN());
    }
    return user;
  };
  
  createMaterial = async (req: CreateMaterialReq): Promise<Material> => {
    const materialProcess: MaterialProcess | null = await sellRepo.getMaterialProcessByOwnerId(req.owner.id);
    if (!materialProcess) {
      throw new BusErr(BUS_ERR_CODE.HAVE_NO_PROCESS_STEP(), req);
    }
    
    const processes: Process[] = materialProcess.processSteps.map((processStep: ProcessStep) => {
      processStep.dynProperties.forEach((dynProperty: DynProperty): void => {
        dynProperty.value = CONSTANTS.STR_EMPTY;
        dynProperty.id = uuid.v4();
      });
      return {
        ...processStep,
        id: uuid.v4(),
        code: CONSTANTS.STR_EMPTY,
        status: ProcessStatus.TODO,
        activities: [],
        workers: [],
        updateAt: DateUtil.getTime()
      };
    });
    
    const entity: Material = {
      ...req,
      id: uuid.v4(),
      createdAt: DateUtil.getTime(),
      updatedAt: DateUtil.getTime(),
      code: this.genUserInfoCode('CREATE ' + req.name, req.owner),
      processes: processes
    };
    
    await sellRepo.insertMaterial(entity);
    return entity;
  };
  
  updateProcessInfo = async (req: UpdateProcessInfoReq): Promise<boolean> => {
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    
    data.process.dynProperties.forEach((p: DynProperty): void => {
      const field: UpdateProcessField | undefined = req.values.find((v: UpdateProcessField): boolean => {
        return v.id === p.id;
      });
      if (field) {
        p.value = field.value;
      }
    });
    
    return sellRepo.updateMaterial(data.material);
  };
  
  assignWorker = async (req: AssignWorkerReq): Promise<boolean> => {
    const user: User | null = await sellRepo.getUserById(req.userId);
    if (!user) {
      throw new BusErr(BUS_ERR_CODE.WORKER_CANNOT_FOUND(), req)
    }
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    
    const worker: User | undefined = data.process.workers.find((w: User): boolean => {
      return w.id === req.userId;
    });
    if (worker) {
      throw new BusErr(BUS_ERR_CODE.WORKER_HAD_ASSIGNED())
    }
    data.process.workers.push(user);
    
    return sellRepo.updateMaterial(data.material);
  };
  
  addActivity = async (req: AddActivityReq): Promise<boolean> => {
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    data.process.activities.push(req.activity);
    data.process.status = ProcessStatus.IN_PROGRESS;
    data.process.updateAt = DateUtil.getTime();
    return sellRepo.updateMaterial(data.material);
  };
  
  doneProcess = async (req: DoneProcessReq): Promise<boolean> => {
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    data.process.status = ProcessStatus.DONE;
    
    const code: string = this.genUserInfoCode(`[DONE ${data.process.name}]`, req.userInfo);
    data.material.code = code;
    data.material.updatedAt = DateUtil.getTime();
    data.process.code = code;
    data.process.updateAt = DateUtil.getTime();
    return sellRepo.updateMaterial(data.material);
  };
  
  getMaterialById = async (req: { id: string }): Promise<Material | null> => {
    return this.getMaterial(req.id);
  };
  
  getMaterialsByOwnerId = async (req: { id: string }): Promise<Material[]> => {
    return sellRepo.getMaterialsByOwnerId(req.id);
  };
  
  getMaterialProcessByOwnerId = async (req: { id: string }): Promise<MaterialProcess | null> => {
    return sellRepo.getMaterialProcessByOwnerId(req.id);
  };
  
  updateProcessDynProperties = async (req: UpdateProcessDynPropertiesReq): Promise<boolean> => {
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    data.process.dynProperties = req.properties;
    data.material.updatedAt = DateUtil.getTime();
    return sellRepo.updateMaterial(data.material);
  };
  
  saveMaterialProcess = async (req: SaveMaterialProcessReq): Promise<boolean | null> => {
    req.processSteps.forEach((p: ProcessStep): void => {
      p.id = uuid.v4();
      p.dynProperties.forEach((d: DynProperty): void => {
        d.id = uuid.v4();
      });
    });
    
    let materialProcess: MaterialProcess | null = await sellRepo.getMaterialProcessByOwnerId(req.ownerId);
    if (materialProcess) {
      materialProcess.processSteps = req.processSteps;
      return sellRepo.updateMaterialProcess(materialProcess);
    }
    else {
      materialProcess = {
        ...req,
        id: uuid.v4()
      };
      return sellRepo.insertMaterialProcess(materialProcess);
    }
  };
  
  getCategories = async (): Promise<Category[]> => {
    return sellRepo.getCategories();
  };
  
  createItem = async (req: CreateItemReq): Promise<Item> => {
    const sellCode: string = this.genUserInfoCode('SELL', req.owner);
    
    const item: Item = {
      ...req,
      id: uuid.v4(),
      sellCode: sellCode, // the code is generated when user public goods to sell
      buyerCode: CONSTANTS.STR_EMPTY,
      buyer: null,
      transactions: [
        {
          ...req.owner, action: TransactionAction.CREATE
        }
      ],
      view3d: CONSTANTS.STR_EMPTY,
      time: DateUtil.getTime(),
      maintains: []
    };
    
    const res: boolean = await sellRepo.createItem(item);
    if (!res) {
      throw new BusErr(BUS_ERR_CODE.CANNOT_CREATE_GOODS());
    }
    return item;
  };
  
  publicSell = async (req: { id: string, owner: UserInfo }): Promise<Item> => {
    const item: Item | null = await sellRepo.getItembyId(req.id);
    if (!item) {
      throw new BusErr(BUS_ERR_CODE.CANNOT_FOUND_GOODS());
    }
    item.sellCode = this.genUserInfoCode('SELL', req.owner);
    item.transactions.push({
      ...req.owner,
      action: TransactionAction.SELL
    });
    const res: boolean = await sellRepo.updateItem(item);
    if (!res) {
      throw new BusErr(BUS_ERR_CODE.CANNOT_PUBLICH_SELL());
    }
    return item;
  };
  
  cancelSell = async (req: { id: string, owner: UserInfo }): Promise<Item> => {
    const item: Item | null = await sellRepo.getItembyId(req.id);
    if (!item) {
      throw new BusErr(BUS_ERR_CODE.CANNOT_FOUND_GOODS());
    }
    item.sellCode = CONSTANTS.STR_EMPTY;
    
    const res: boolean = await sellRepo.updateItem(item);
    if (!res) {
      throw new BusErr(BUS_ERR_CODE.CANNOT_CANCEL_SELL());
    }
    return item;
  };
  
  getItemsByOwnerId = async (req: { id: string }): Promise<Item[]> => {
    return sellRepo.getItemsByOwnerId(req.id);
  };
  
  private getMaterial = async (id: string): Promise<Material | null> => {
    return sellRepo.getMaterialById(id);
  };
  
  private getMaterial_Process = async (materialId: string, processId: string): Promise<{ material: Material, process: Process }> => {
    const material: Material | null = await this.getMaterial(materialId);
    if (!material) {
      throw new BusErr(BUS_ERR_CODE.MATERIAL_CANNOT_FOUND());
    }
    const process: Process | undefined = material.processes.find((p: Process): boolean => {
      return p.id === processId;
    });
    
    if (!process) {
      throw new BusErr(BUS_ERR_CODE.PROCESS_CANNOT_FOUND())
    }
    return {material, process};
  }
}

export default new SellRecognizer();
