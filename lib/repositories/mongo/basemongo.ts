import {
  MongoClient,
  Db,
  Collection,
  InsertOneWriteOpResult,
  MongoClientOptions,
  MongoCallback,
  MongoError
} from 'mongodb';
import { GenericRepo } from '../generic/genericrepo';

// that class only can be extended
export abstract class BaseMongo<T> implements GenericRepo<T> {
  //creating a property to use your code in all instances
  // that extends your base repository and reuse on methods of class
  public db!: Db;
  public collection!: Collection;

  //we created constructor with arguments to manipulate mongodb operations
  protected constructor(connectionString: string, dbName: string, collectionName: string) {
    const client: MongoClient = new MongoClient(connectionString,{ useNewUrlParser: true });
    client.connect(
      (error: MongoError, connect: MongoClient): void => {
        if (error) {
          console.log('Mongodb cannot be connected with ' + connectionString);
        } else {
          this.db = connect.db(dbName);
          this.collection = this.db.collection(collectionName);
          // console.log('Mongodb connected success with ' + connectionString);
        }
      }
    );
  }

  // we add to method, the async keyword to manipulate the insert result
  // of method.
  async create(item: T): Promise<boolean> {
    const result: InsertOneWriteOpResult = await this.collection.insertOne(item);
    // after the insert operations, we returns only ok property (that haves a 1 or 0 results)
    // and we convert to boolean result (0 false, 1 true)
    return !!result.result.ok;
  }

  update(id: string, item: T): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  find(item: T): Promise<T[]> {
    throw new Error('Method not implemented.');
  }
  findOne(id: string): Promise<T> {
    throw new Error('Method not implemented.');
  }
  findOneBy = async (expr: {}): Promise<T | null> => {
    const res: T | null = await this.collection.findOne(expr);
    return res;
  };
}
