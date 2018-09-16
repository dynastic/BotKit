import { RoleOptions } from ".";
export declare let SUCCESS_EMOJI: string;
export declare let FAIL_EMOJI: string;
export declare let WARNING_EMOJI: string;
export declare let DELETE_EMOJI: string;
export declare let COMMAND_PREFIX: string;
export declare let ARGUMENT_REGEX: RegExp;
export declare let BOT_ICON: string;
export declare let BOT_AUTHOR: string;
export declare let TEMP_DIR: string;
export declare let COLORS: {
    DANGER: number;
};
export declare enum ErrorFormat {
    EMBED = 0,
    TEXT = 1
}
export declare let ERROR_RENDER_FORMAT: ErrorFormat;
export declare let ROLES: RoleOptions;
export declare let ROLES_INCLUSIVE: RoleOptions;
export declare const ERROR_PREFIX = "**Uh oh!**";
export interface PatchableConstants {
    SUCCESS_EMOJI: string;
    FAIL_EMOJI: string;
    WARNING_EMOJI: string;
    DELETE_EMOJI: string;
    COMMAND_PREFIX: string;
    ARGUMENT_REGEX: string;
    BOT_ICON: string;
    BOT_AUTHOR: string;
    TEMP_DIR: string;
    COLORS: {
        DANGER: number;
        [key: string]: number;
    };
    ERROR_RENDER_FORMAT: ErrorFormat;
    ROLES: RoleOptions;
    ERROR_PREFIX: string;
}
export declare function applyPatches(patches: Partial<PatchableConstants>): void;
