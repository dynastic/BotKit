"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const flake_idgen_1 = __importDefault(require("flake-idgen"));
const biguint_format_1 = __importDefault(require("biguint-format"));
const winston = __importStar(require("winston"));
const flaker = new flake_idgen_1.default({ id: Number.parseInt(process.env.SERVER_ID) || 0, epoch: 1514764800000 });
var Security;
(function (Security) {
    /**
     * Creates a unique snowflake
     */
    function snowflake() {
        return new Promise((resolve, reject) => {
            flaker.next((err, id) => {
                err ? reject(err) : resolve(biguint_format_1.default(id, 'dec'));
            });
        });
    }
    Security.snowflake = snowflake;
    /**
     * Creates a secure random string of a given length
     * @param length the length
     */
    function random(length) {
        return new Promise((resolve, reject) => {
            crypto_1.default.randomBytes(length / 2, function (err, buffer) {
                err ? reject(err) : resolve(buffer.toString("hex"));
            });
        });
    }
    Security.random = random;
})(Security = exports.Security || (exports.Security = {}));
var Miscellaneous;
(function (Miscellaneous) {
    /**
     * Returns an object with a promise and a callback
     */
    function callbackPromise() {
        let struct = {};
        struct.promise = new Promise((resolve) => struct.cb = resolve);
        return struct;
    }
    Miscellaneous.callbackPromise = callbackPromise;
})(Miscellaneous = exports.Miscellaneous || (exports.Miscellaneous = {}));
var ArrayUtils;
(function (ArrayUtils) {
    function uniqueMerge(array1, array2) {
        array2.forEach(val => array1.indexOf(val) > -1 ? undefined : array1.push(val));
        return array1;
    }
    ArrayUtils.uniqueMerge = uniqueMerge;
    function uniqueConcat(array1, array2) {
        const uniqueArray = [];
        array1.concat(array2).forEach(val => uniqueArray.indexOf(val) > -1 ? undefined : uniqueArray.push(val));
        return uniqueArray;
    }
    ArrayUtils.uniqueConcat = uniqueConcat;
})(ArrayUtils = exports.ArrayUtils || (exports.ArrayUtils = {}));
exports.Logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: "debug",
            handleExceptions: false,
            json: false,
            colorize: true,
        }),
    ],
    exitOnError: false,
});
//# sourceMappingURL=util.js.map