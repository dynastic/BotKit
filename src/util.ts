import uintformat from "biguint-format";
import crypto from "crypto";
import flake from "flake-idgen";
import * as winston from "winston";
import { Constants } from ".";

const flaker = new flake({id: Number.parseInt(process.env.SERVER_ID as string) || 0, epoch: 1514764800000});

export namespace Security {
    /**
     * Creates a unique snowflake
     */
    export function snowflake(): Promise<string> {
        return new Promise((resolve, reject) => {
            flaker.next((err, id) => {
                err ? reject(err) : resolve(uintformat(id, 'dec'));
            });
        });
    }
    /**
     * Creates a secure random string of a given length
     * @param length the length
     */
    export function random(length: number): Promise<string> {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(length / 2, function(err, buffer) {
                err ? reject(err) : resolve(buffer.toString("hex"));
            });
        })
    }
}

export namespace Miscellaneous {
    /**
     * Returns an object with a promise and a callback
     */
    export function callbackPromise(): {cb: () => void, promise: Promise<void>} {
        let struct: Partial<{cb: () => void, promise: Promise<void>}> = {};
        struct.promise = new Promise((resolve) => struct.cb = resolve);
        return struct as any;
    }

    export function sortNumbersInObject(obj: {[key: string]: number}) {
        const sortable: Array<[string, number]> = [];

        for (let key in obj) {
            sortable.push([key, obj[key]]);
        }

        sortable.sort((a, b) => a[1] - b[1]);

        return sortable;
    }
}

export const Logger = new winston.Logger({
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