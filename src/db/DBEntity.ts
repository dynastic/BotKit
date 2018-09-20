import { BaseEntity, PrimaryColumn, ObjectType, DeepPartial, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Security } from "../util";

/**
 * An enhanced base class for database entities
 */
export class DBEntity extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @CreateDateColumn()
    openedOn: Date;

    public get openedOnUnix(): number {
        return Math.floor(this.openedOn.getTime() / 1000);
    }

    @UpdateDateColumn()
    updatedOn: Date;

    static async create<T extends DBEntity>(this: ObjectType<T>, entity?: DeepPartial<T> | DeepPartial<T>[]): Promise<T> {
        const obj: T = super.create(entity as any) as any;
        obj.id = await Security.snowflake();
        return obj;
    }
}