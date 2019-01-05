import { createConnection } from "typeorm";

import { Configuration } from "../Config";

export function connect() {
    return createConnection({
        entities: [__dirname + "/entities/*.ts"],
        ...Configuration.Database
    });
}
