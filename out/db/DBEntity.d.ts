import { BaseEntity, ObjectType, DeepPartial } from "typeorm";
export declare class DBEntity extends BaseEntity {
    id: string;
    openedOn: Date;
    readonly openedOnUnix: number;
    updatedOn: Date;
    static create<T extends DBEntity>(this: ObjectType<T>, entity?: DeepPartial<T> | DeepPartial<T>[]): Promise<T>;
}