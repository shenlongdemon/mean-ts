import {Request, Response} from 'express';
import {ApiResult} from '../services/models';
import {CONSTANTS, API_STATUS_CODE} from '../services/commons';
import {BusErr} from '../services/models/buserr';
import SellRecognizer from '../services/sellrecognizer/services/sellrecognizer';
import {NextFunction} from 'express-serve-static-core';

const safeJsonStringify = require('safe-json-stringify');

export class Controller {
  private map: { [name: string]: {} } = {};
  
  constructor() {
    this.mapServices();
  }
  
  private mapServices = (): void => {
    this.map['SellRecognizer'.toLowerCase()] = SellRecognizer;
  };
  
  doPost = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const serviceName: string = request.params.controller.toLowerCase();
    const actionName: string = request.params.action;
    const data: any = request.body;
    console.log('POST ' + serviceName + '.' + actionName + '()');
    try {
      const service = this.getService(serviceName);
      const res: any = await service[actionName](data);
      const apiResult: ApiResult = {
        code: API_STATUS_CODE.OK,
        message: CONSTANTS.STR_EMPTY,
        data: res
      };
      response.status(200).json(apiResult);
    } catch (ex) {
      this.handleException(ex, request, response);
    }
  };
  
  doGet = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const serviceName: string = request.params.controller.toLowerCase();
    const actionName: string = request.params.action;
    console.log('GET ' + serviceName + '.' + actionName + '()');
    
    const queries = Object.getOwnPropertyNames(request.query);
    const data: any = {};
    queries.forEach(
      (queryName: string, index: number): void => {
        const value = request.query[queryName];
        data[queryName] = value;
      }
    );
    
    try {
      const service = this.getService(serviceName);
      console.log(service);
      const res: any = await service[actionName](data);
      const apiResult: ApiResult = {
        code: API_STATUS_CODE.OK,
        message: CONSTANTS.STR_EMPTY,
        data: res
      };
      response.status(200).json(apiResult);
    } catch (ex) {
      this.handleException(ex, request, response);
    }
  };
  
  private handleException = (ex: any, request: Request, response: Response): void => {
    if (ex instanceof BusErr) {
      const res: ApiResult = this.handleError(ex, request, response);
      response.status(200).json(res);
    } else {
      const res: ApiResult = this.handleCommonError(ex, request, response);
      response.status(200).json(res);
    }
  }
  
  private getService(service: string): any {
    return this.map[service.toLowerCase()];
  }
  
  private handleError = (ex: BusErr, request: Request, response: Response): ApiResult => {
    const res: ApiResult = {
      code: ex.code,
      message: ex.message,
      data: {
        data: ex.data,
        request: JSON.parse(safeJsonStringify(request)),
        response: JSON.parse(safeJsonStringify(response))
      }
    };
    console.log(safeJsonStringify(res));
  
    return res;
  };
  
  private handleCommonError = (ex: any, request: Request, response: Response): ApiResult => {
    const res: ApiResult = {
      code: API_STATUS_CODE.EXCEPTION,
      message: 'Internal server error !',
      data: {
        data: JSON.parse(safeJsonStringify(ex)),
        request: JSON.parse(safeJsonStringify(request)),
        response: JSON.parse(safeJsonStringify(response))
      }
    };
    console.log(safeJsonStringify(res));
  
    return res;
  };
}

export default new Controller();
