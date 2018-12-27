import * as winston from "winston";
export declare namespace Security {
    /**
     * Creates a unique snowflake
     */
    function snowflake(): Promise<string>;
    /**
     * Creates a secure random string of a given length
     * @param length the length
     */
    function random(length: number): Promise<string>;
}
export declare namespace Miscellaneous {
    /**
     * Returns an object with a promise and a callback
     */
    function callbackPromise(): {
        cb: () => void;
        promise: Promise<void>;
    };
}
export declare namespace ArrayUtils {
    function uniqueMerge<K, T>(array1: K[], array2: T[]): Array<K | T>;
    function uniqueConcat<K, T>(array1: K[], array2: T[]): Array<K | T>;
}
export declare const Logger: winston.LoggerInstance;
