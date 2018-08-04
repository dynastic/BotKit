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
export declare const Logger: winston.LoggerInstance;
