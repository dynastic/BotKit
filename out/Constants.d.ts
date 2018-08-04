import { RoleOptions } from ".";
export declare const SUCCESS_EMOJI = "\uD83C\uDD97";
export declare const FAIL_EMOJI = "\u274C";
export declare const WARNING_EMOJI = "\u26A0";
export declare const DELETE_EMOJI = "\uD83D\uDDD1";
export declare let COMMAND_PREFIX: string;
export declare const ARGUMENT_REGEX: RegExp;
export declare const DYNASTIC_ICON = "https://assets.dynastic.co/brand/img/icon-64.png";
export declare const TEMP_DIR = "/tmp/bot-downloads";
export declare const COLORS: {
    DANGER: number;
};
export declare enum ErrorFormat {
    EMBED = 0,
    TEXT = 1
}
export declare let ERROR_RENDER_FORMAT: ErrorFormat;
export declare let ROLES: RoleOptions;
export declare function applyPatches(patches: Partial<{
    commandPrefix: string;
    errorFormat: ErrorFormat;
    roles: RoleOptions;
}>): void;
