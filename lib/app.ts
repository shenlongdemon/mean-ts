// lib/app.ts
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { ApiResult } from './services/models';
import { API_STATUS_CODE, HTTP_CODE } from './services/commons';
import Controller from './controllers';
const cors = require('cors');
const safeJsonStringify = require('safe-json-stringify');

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
  }

  private errorRequestHandler = (err: any, request: Request, response: Response, next: NextFunction): any => {
    console.log('App error: ' + err);
    const res: ApiResult = this.handleError(err, request, response);
    response.status(HTTP_CODE.OK).json(res);
  };

  private handleError = (err: any, request: Request, response: Response): ApiResult => {
    const res: ApiResult = {
      code: API_STATUS_CODE.EXCEPTION,
      message: 'Internal server error !',
      data: {
        data: JSON.parse(safeJsonStringify(err)),
        request: JSON.parse(safeJsonStringify(request)),
        response: JSON.parse(safeJsonStringify(response))
      }
    };
    return res;
  };

  private config(): void {
    console.log('config success');
    this.app.use(cors());

    // support application/json type post data
    this.app.use(bodyParser.json());
    //support application/x-www-form-urlencoded post data
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // static
    this.app.use(express.static(__dirname + '/../static/public'));
    this.app.use('/', express.static(__dirname + '/../static/portal/dist/ng7-pre'));
    this.app.use(this.errorRequestHandler);

    this.app.post('/api/:controller/:action', Controller.doPost);
    this.app.get('/api/:controller/:action', Controller.doGet);
    
    this.app.post('/upload/:controller', Controller.doUpload);
  }
}

export default new App().app;
