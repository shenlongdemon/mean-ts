import {BaseService} from './baseservice';
import {
  AddActivityReq,
  AddMaintainReq,
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
  Activity,
  Category,
  DynProperty,
  Item,
  Material,
  MaterialProcess,
  ObjectByCode,
  ObjectType,
  Process,
  ProcessStatus,
  ProcessStep,
  Transaction,
  TransactionAction,
  User,
  UserInfo
} from "../shared/models";
import {CreateItemReq} from "./requests/createitemreq";
import {UpdateProcessDynPropertiesReq} from "./requests/UpdateProcessDynPropertiesReq";
import {ITEM_ACTION} from "./commons/constant";
import {isBoolean} from "util";

const uuid = require('uuid');

class SellRecognizer extends BaseService {
  
  constructor() {
    super();
  }
  
  getActivity = async (req: { activityId: string, itemId: string, materialId: string, processId: string }): Promise<Activity | null> => {
    const getActvityInMaintain = this.getActivityInMaintain(req.itemId, req.activityId);
    const getActvityInMaterial = this.getActivityInMaterial(req.materialId, req.processId, req.activityId);
    const [item, material] = await Promise.all([getActvityInMaintain, getActvityInMaterial]);
    
    let activity: Activity | null = null;
    if (item) {
      activity = item.maintains.find((act: Activity): boolean => {
        return act.id === req.activityId
      }) || null;
      
      if (!activity && item.material) {
        const activities: Activity[] = [];
        item.material.processes.forEach((process: Process): void => {
          activities.push.apply(activities, process.activities);
        });
  
        activity = activities.find((act: Activity): boolean => {
          return act.id === req.activityId
        }) || null;
      }
    }
    else if (material) {
      const activities: Activity[] = [];
      material.processes.forEach((process: Process): void => {
        activities.push.apply(activities, process.activities);
      });
      
      activity = activities.find((act: Activity): boolean => {
        return act.id === req.activityId
      }) || null;
    }
    
    return activity;
  };
  
  getActivityInMaintain = async (itemId: string, activityId: string): Promise<Item | null> => {
    return sellRepo.getActivityInMaintain(itemId, activityId);
  };
  
  getActivityInMaterial = async (materialId: string, processId: string, activityId: string): Promise<Material | null> => {
    return sellRepo.getActivityInMaterial(materialId, processId, activityId);
  };
  
  getProducts = async (req: { categoryId: string }): Promise<Item[]> => {
    return sellRepo.getPublishItems(req.categoryId);
  };
  
  doItemAction = async (req: { id: string, action: ITEM_ACTION, userInfo: UserInfo }): Promise<Item> => {
    const item: Item = await this.getItem(req.id);
    req.userInfo.time = DateUtil.getTime();
    if (req.action === ITEM_ACTION.CANCEL) {
      if (item.buyer) {
        throw new BusErr(BUS_ERR_CODE.BOUGHT_BY_OTHER());
      }
      item.sellCode = CONSTANTS.STR_EMPTY;
      req.userInfo.code = this.genUserInfoCode(`CANCEL-${item.name}`, req.userInfo);
    }
    else if (req.action === ITEM_ACTION.PUBLISH) {
      if (item.owner.id !== req.userInfo.id) {
        throw new BusErr(BUS_ERR_CODE.ITEM_NOT_YOURS());
      }
      if (item.buyer) {
        throw new BusErr(BUS_ERR_CODE.BOUGHT_BY_OTHER());
      }
      item.sellCode = this.genUserInfoCode(`SELL-${item.name}`, req.userInfo);
      req.userInfo.code = item.sellCode;
    }
    else if (req.action === ITEM_ACTION.BUY) {
      if (!item.sellCode.length) {
        throw new BusErr(BUS_ERR_CODE.ITEM_CANNOT_FOUND());
      }
      if (item.buyer) {
        throw new BusErr(BUS_ERR_CODE.BOUGHT_BY_OTHER());
      }
      req.userInfo.code = this.genUserInfoCode(`BUY-${item.name}`, req.userInfo);
      item.buyer = req.userInfo;
    }
    else if (req.action === ITEM_ACTION.RECEIVE) {
      if (!item.buyer) {
        throw new BusErr(BUS_ERR_CODE.ITEM_CANNOT_FOUND());
      }
      if (item.buyer && item.buyer!.id !== req.userInfo.id) {
        throw new BusErr(BUS_ERR_CODE.ITEM_NOT_YOURS());
      }
      req.userInfo.code = this.genUserInfoCode(`RECEIVE-${item.name}`, req.userInfo);
      item.owner = req.userInfo;
      item.buyer = null;
      const transaction: Transaction = {
        ...req.userInfo,
        action: TransactionAction.BUY
      };
      item.transactions.push(transaction);
    }
    item.code = req.userInfo.code;
    item.updatedAt = DateUtil.getTime();
    await sellRepo.updateItem(item);
    return item;
  };
  
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
    data.process.status = ProcessStatus.IN_PROGRESS;
    data.process.updateAt = DateUtil.getTime();
    data.material.updatedAt = DateUtil.getTime();
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
    data.process.status = ProcessStatus.IN_PROGRESS;
    data.process.workers.push(user);
    data.process.updateAt = DateUtil.getTime();
    data.material.updatedAt = DateUtil.getTime();
    return sellRepo.updateMaterial(data.material);
  };
  
  addActivity = async (req: AddActivityReq): Promise<boolean> => {
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    req.userInfo.code = this.genUserInfoCode(`[ACT-${req.title}]`, req.userInfo);
    ;
    const activity: Activity = {
      id: uuid.v4(),
      title: req.title,
      description: req.description,
      image: req.image,
      file: req.file,
      userInfo: req.userInfo,
      time: DateUtil.getTime()
    };
    data.process.activities.push(activity);
    data.process.status = ProcessStatus.IN_PROGRESS;
    data.process.updateAt = DateUtil.getTime();
    data.material.updatedAt = DateUtil.getTime();
    const ok: boolean = await sellRepo.updateMaterial(data.material);
    if (!ok) {
      throw new BusErr(BUS_ERR_CODE.CANNOT_SAVE());
    }
    return ok;
  };
  addMaintain = async (req: AddMaintainReq): Promise<boolean> => {
    req.userInfo.code = this.genUserInfoCode(`MAINTAIN-${req.title}`, req.userInfo);
    const activity: Activity = {
      id: uuid.v4(),
      title: req.title,
      description: req.description,
      image: req.image,
      file: req.file,
      userInfo: req.userInfo,
      time: DateUtil.getTime()
    };
    const item: Item = await this.getItem(req.itemId);
    item.maintains.push(activity);
    item.updatedAt = DateUtil.getTime();
    const ok: boolean = await sellRepo.updateItem(item);
    if (!ok) {
      throw new BusErr(BUS_ERR_CODE.CANNOT_SAVE());
    }
    return ok;
  };
  doneProcess = async (req: DoneProcessReq): Promise<boolean> => {
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    data.process.status = ProcessStatus.DONE;
    
    const code: string = this.genUserInfoCode(`DONE ${data.process.name}`, req.userInfo);
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
    data.process.status = ProcessStatus.IN_PROGRESS;
    data.process.updateAt = DateUtil.getTime();
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
    req.owner.code = this.genUserInfoCode('NEW_ITEM', req.owner);
    const sellCode: string = this.genUserInfoCode('SELL', req.owner);
    
    const item: Item = {
      ...req,
      id: uuid.v4(),
      code: sellCode,
      sellCode: sellCode, // the code is generated when user public goods to sell
      buyer: null,
      transactions: [
        {
          ...req.owner, action: TransactionAction.CREATE
        }
      ],
      view3d: CONSTANTS.STR_EMPTY,
      time: DateUtil.getTime(),
      maintains: [],
      updatedAt: DateUtil.getTime(),
      createdAt: DateUtil.getTime()
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
    item.updatedAt = DateUtil.getTime();
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
    item.updatedAt = DateUtil.getTime();
    const res: boolean = await sellRepo.updateItem(item);
    if (!res) {
      throw new BusErr(BUS_ERR_CODE.CANNOT_CANCEL_SELL());
    }
    return item;
  };
  
  getItemsByOwnerId = async (req: { id: string }): Promise<Item[]> => {
    return sellRepo.getItemsByOwnerId(req.id);
  };
  
  getObjectByCode = async (req: { code: string }): Promise<ObjectByCode> => {
    
    
    const task_getUserById = sellRepo.getUserById(req.code);
    const task_getMaterialById = sellRepo.getMaterialById(req.code);
    const task_getMaterialByCode = sellRepo.getMaterialByCode(req.code);
    const task_getItemById = sellRepo.getItembyId(req.code);
    const task_getItemByCode = sellRepo.getItemByCode(req.code);
    
    const [user, materialById, materialByCode, itemById, itemByCode] = await Promise.all([task_getUserById, task_getMaterialById, task_getMaterialByCode, task_getItemById, task_getItemByCode]);
    let data: ObjectByCode = {
      item: null,
      type: ObjectType.unknown
    };
    
    if (user) {
      data = {
        item: user,
        type: ObjectType.user
      };
    }
    else if (materialById) {
      data = {
        item: materialById,
        type: ObjectType.material
      };
    }
    else if (materialByCode) {
      data = {
        item: materialByCode,
        type: ObjectType.material
      };
    }
    else if (itemById) {
      data = {
        item: itemById,
        type: ObjectType.item
      };
    }
    else if (itemByCode) {
      data = {
        item: itemByCode,
        type: ObjectType.item
      };
    }
    return data;
  };
  getObjectsByBluetoothIds = async (req: { ids: string[] }): Promise<ObjectByCode[]> => {
    const task_getMaterialsByBluetoothIds = sellRepo.getMaterialsByBluetoothIds(req.ids);
    const task_getItemsByBluetoothIds = sellRepo.getItemsByBluetoothIds(req.ids);
    const [materialsBybluetoothIds, itemsBybluetoothIds] = await Promise.all([task_getMaterialsByBluetoothIds, task_getItemsByBluetoothIds]);
    
    const objs: ObjectByCode[] = [];
    
    objs.push.apply(objs, materialsBybluetoothIds.map((material: Material): ObjectByCode => {
      return {type: ObjectType.material, item: material};
    }));
    
    objs.push.apply(objs, itemsBybluetoothIds.map((item: Item): ObjectByCode => {
      return {type: ObjectType.item, item: item};
    }));
    
    return objs;
    
  };
  
  getProcess = async (req: { materialId: string, processId: string }): Promise<Process | null> => {
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    return data.process;
  };
  
  getItemById = async (req: { id: string }): Promise<Item | null> => {
    return sellRepo.getItembyId(req.id);
  };
  
  private getMaterial = async (id: string): Promise<Material | null> => {
    return sellRepo.getMaterialById(id);
  };
  
  private getItem = async (itemId: string): Promise<Item> => {
    const item: Item | null = await sellRepo.getItembyId(itemId);
    if (!item) {
      throw new BusErr(BUS_ERR_CODE.ITEM_CANNOT_FOUND());
    }
    return item;
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
  
  getActivities = async (req: { materialId: string, processId: string, workerId: string }): Promise<Activity[]> => {
    const data: { material: Material, process: Process } = await this.getMaterial_Process(req.materialId, req.processId);
    return data.process.activities.filter((activity: Activity): boolean => {
      return activity.userInfo.id === req.workerId;
    });
  };
  
  getCodeDescription = async (req: { code: string }): Promise<string> => {
    return this.convertCodeToDescription(req.code);
  }
}

export default new SellRecognizer();
