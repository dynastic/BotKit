import { RoleOptions } from ".";

export let SUCCESS_EMOJI = '🆗';

export let FAIL_EMOJI = '❌';

export let WARNING_EMOJI = '⚠';

export let DELETE_EMOJI = '🗑';

export let COMMAND_PREFIX = '*';

export let ARGUMENT_REGEX = /[^'"\s]+|(?:["'])([^'"]+)(?:["'])/g;

export let BOT_ICON = "https://assets.dynastic.co/brand/img/icon-64.png";

export let BOT_AUTHOR = "Dynastic";

export let TEMP_DIR = "/tmp/bot-downloads";

export let COLORS = {
    DANGER: 0xff895e
};

export enum ErrorFormat {
    EMBED, TEXT
}

export let ERROR_RENDER_FORMAT: ErrorFormat = ErrorFormat.EMBED;

export let ROLES: RoleOptions = {moderator: [], admin: [], root: []};

export let ROLES_INCLUSIVE: RoleOptions = {moderator: [], admin: [], root: []};

export const ERROR_PREFIX = "**Uh oh!**";

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

function recalculateInclusiveRoles() {
    const moderator: {[key: string]: boolean} = {}, admin: {[key: string]: boolean} = {}, root: {[key: string]: boolean} = {};
    for (let rootID of ROLES.root) moderator[rootID] = admin[rootID] = root[rootID] = true;
    for (let adminID of ROLES.admin) moderator[adminID] = admin[adminID] = true;
    for (let moderatorID of ROLES.moderator) moderator[moderatorID] = true;
    ROLES_INCLUSIVE = {moderator: Object.keys(moderator), admin: Object.keys(admin), root: Object.keys(root)};
}

export function applyPatches(patches: Partial<PatchableConstants>) {
    let script = "";
    for (let key in patches) {
        script += `exports.${key} = patches.${key} || exports.${key};`;
    }
    eval(script);
    if (patches.ROLES) {
        recalculateInclusiveRoles();
    }
}