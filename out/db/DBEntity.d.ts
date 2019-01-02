import { BaseEntity, DeepPartial, ObjectType } from "typeorm";
/**
 * An enhanced base class for database entities
 */
export declare class DBEntity extends BaseEntity {
    id: string;
    openedOn: Date;
    readonly openedOnUnix: number;
    updatedOn: Date;
    static create<T extends DBEntity>(this: ObjectType<T>, entity?: DeepPartial<T> | DeepPartial<T>[]): Promise<T>;
}
