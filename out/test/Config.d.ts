import { ConnectionOptions } from "typeorm";
export declare namespace Configuration {
    const Bot: {
        token: string;
        prefix: string;
        superusers: string[];
    };
    const Database: ConnectionOptions;
}
