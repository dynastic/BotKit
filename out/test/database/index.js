"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Config_1 = require("../Config");
function connect() {
    return typeorm_1.createConnection({
        entities: [__dirname + "/entities/*.ts"],
        ...Config_1.Configuration.Database
    });
}
exports.connect = connect;
//# sourceMappingURL=index.js.map