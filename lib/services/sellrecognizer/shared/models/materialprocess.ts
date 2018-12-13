import {IObject} from "./iobject";
import {ProcessStep} from "./processstep";

export interface MaterialProcess extends IObject{
  ownerId: string;
  processSteps: ProcessStep[];
}