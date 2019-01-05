import { ConnectionOptions } from "typeorm";

export namespace Configuration {
    export const Bot = {
        token: "",
        prefix: "*",
        superusers: [] as string[]
    };

    export const Database: ConnectionOptions = {
        type: "postgres",
        host: "localhost",
        port: 5432,
        database: "JailbreakBot",
        synchronize: true
    };
}