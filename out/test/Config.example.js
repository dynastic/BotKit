"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Configuration;
(function (Configuration) {
    Configuration.Bot = {
        token: "",
        prefix: "*",
        superusers: []
    };
    Configuration.Database = {
        type: "postgres",
        host: "localhost",
        port: 5432,
        database: "JailbreakBot",
        synchronize: true
    };
})(Configuration = exports.Configuration || (exports.Configuration = {}));
//# sourceMappingURL=Config.example.js.map