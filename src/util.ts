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

/**
 * Computes the inheritence-based role list
 */
export function calculateInclusiveRoles() {
   const moderator: {[key: string]: boolean} = {}, admin: {[key: string]: boolean} = {}, root: {[key: string]: boolean} = {};
   for (let rootID of Constants.ROLES.root) moderator[rootID] = admin[rootID] = root[rootID] = true;
   for (let adminID of Constants.ROLES.admin) moderator[adminID] = admin[adminID] = true;
   for (let moderatorID of Constants.ROLES.moderator) moderator[moderatorID] = true;
   return {moderator: Object.keys(moderator), admin: Object.keys(admin), root: Object.keys(root)};
}