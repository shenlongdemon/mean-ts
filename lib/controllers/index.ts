import {Request, RequestHandler, Response} from 'express';
import {ApiResult} from '../services/models';
import {CONSTANTS, API_STATUS_CODE, HTTP_CODE, SYSTEM_ERR_CODE} from '../services/commons';
import {BusErr} from '../services/models/buserr';
import SellRecognizer from '../services/sellrecognizer/services/sellrecognizer';
import {NextFunction} from 'express-serve-static-core';

const safeJsonStringify = require('safe-json-stringify');
import * as multer from 'multer';

import * as fs from 'fs';

export class Controller {
  private map: { [name: string]: {} } = {};
  
  constructor() {
    this.mapServices();
  }
  
  private mapServices = (): void => {
    this.map['sellrecognizer'] = SellRecognizer;
  };
  
  doUpload = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    
    const serviceName: string = request.params.controller.toLowerCase();
    console.log('POST upload file to ' + serviceName);
    
    try {
      const storage = multer.diskStorage({
        destination: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => {
          const destination: string = `./static/public/${serviceName}/`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination);
          }
          console.log('upload into ' + destination)
          callback(null, destination)
        },
        filename: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void): void => {
          const overwritten = Object.assign({}, file, {buffer: null});
          console.log('upload file ' + safeJsonStringify(overwritten))
          callback(null, file.originalname);
        }
      });
      const multerInstance: RequestHandler = multer({storage: storage}).array('files', 3);
      
      const res = multerInstance(request, response, next);
      const apiResult: ApiResult = {
        code: API_STATUS_CODE.OK,
        message: CONSTANTS.STR_EMPTY,
        data: res
      };
      response.status(HTTP_CODE.OK).json(apiResult);
      
    } catch (ex) {
      this.handleException(ex, request, response);
    }
  };
  
  doPost = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const serviceName: string = request.params.controller.toLowerCase();
    const actionName: string = request.params.action;
    const data: any = request.body;
    try {
      console.log('POST ' + serviceName + '.' + actionName + '(' + safeJsonStringify(data) + ')');
      const service = this.getService(serviceName);
      const res: any = await service[actionName](data);
      const apiResult: ApiResult = {
        code: API_STATUS_CODE.OK,
        message: CONSTANTS.STR_EMPTY,
        data: res
      };
      response.status(HTTP_CODE.OK).json(apiResult);
    } catch (ex) {
      this.handleException(ex, request, response);
    }
  };
  
  doGet = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const serviceName: string = request.params.controller.toLowerCase();
    const actionName: string = request.params.action;
    
    
    const queries = Object.getOwnPropertyNames(request.query);
    const data: any = {};
    queries.forEach(
      (queryName: string, index: number): void => {
        const value = request.query[queryName];
        data[queryName] = value;
      }
    );
    console.log('GET ' + serviceName + '.' + actionName + '(' + safeJsonStringify(data) + ')');
    try {
      const service = this.getService(serviceName);
      const res: any = await service[actionName](data);
      const apiResult: ApiResult = {
        code: API_STATUS_CODE.OK,
        message: CONSTANTS.STR_EMPTY,
        data: res
      };
      response.status(HTTP_CODE.OK).json(apiResult);
    } catch (ex) {
      this.handleException(ex, request, response);
    }
  };
  
  private handleException = (ex: any, request: Request, response: Response): void => {
    if (ex instanceof BusErr) {
      const res: ApiResult = this.handleError(ex, request, response);
      response.status(HTTP_CODE.OK).json(res);
    } else {
      const res: ApiResult = this.handleCommonError(ex, request, response);
      response.status(HTTP_CODE.OK).json(res);
    }
  }
  
  private getService(serviceName: string): any {
    const service = this.map[serviceName.toLowerCase()];
    if (service === null || service === undefined) {
      throw new BusErr(SYSTEM_ERR_CODE.HAVE_NO_SERVICE());
    }
    return service;
  }
  
  private handleError = (ex: BusErr, request: Request, response: Response): ApiResult => {
    const res: ApiResult = {
      code: ex.code,
      message: ex.message,
      data: {
        data: ex.data,
        response: JSON.parse(safeJsonStringify(response)),
        request: JSON.parse(safeJsonStringify(request)),
      }
    };
    console.log(safeJsonStringify(res));
    
    return res;
  };
  
  private handleCommonError = (ex: any, request: Request, response: Response): ApiResult => {
    const res: ApiResult = {
      code: API_STATUS_CODE.EXCEPTION,
      message: ex.message,
      data: {
        data: JSON.parse(safeJsonStringify(ex)),
        response: JSON.parse(safeJsonStringify(response)),
        request: JSON.parse(safeJsonStringify(request)),
      }
    };
    console.log(safeJsonStringify(res));
    
    return res;
  };
}

export default new Controller();
