import { IObject } from './iobject';
import { User } from './user';
import { Activity } from './activity';
import { TaskStatus } from '../common';

export interface Worker extends IObject {
  owner: User;
  activities: Activity[];
  materialId: string;
  materialOwnerId: string;
  status: TaskStatus;
}
