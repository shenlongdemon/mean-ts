export interface GenericRepo<T> {
  find(item: T): Promise<T[]>;
  findOne(id: string): Promise<T>;
  findOneBy(expr: {}): Promise<T | null>;
  create(item: T): Promise<boolean>;
  update(id: string, item: T): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
