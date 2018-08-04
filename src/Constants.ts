import { RoleOptions } from ".";

export const SUCCESS_EMOJI = '🆗';

export const FAIL_EMOJI = '❌';

export const WARNING_EMOJI = '⚠';

export const DELETE_EMOJI = '🗑';

export let COMMAND_PREFIX = '*';

export const ARGUMENT_REGEX = /[^'"\s]+|(?:["'])([^'"]+)(?:["'])/g;

export const DYNASTIC_ICON = "https://assets.dynastic.co/brand/img/icon-64.png";

export const TEMP_DIR = "/tmp/bot-downloads";

export const COLORS = {
    DANGER: 0xff895e
};

export enum ErrorFormat {
    EMBED, TEXT
}

export let ERROR_RENDER_FORMAT: ErrorFormat = ErrorFormat.EMBED;

export const ROLES: RoleOptions = {moderator: [], admin: [], root: []};

export const ROLES_INCLUSIVE: RoleOptions = {moderator: [], admin: [], root: []};

export function applyPatches(patches: Partial<{commandPrefix: string, errorFormat: ErrorFormat, roles: RoleOptions}>) {
    COMMAND_PREFIX = patches.commandPrefix || COMMAND_PREFIX;
    ERROR_RENDER_FORMAT = patches.errorFormat || ERROR_RENDER_FORMAT;
    if (patches.roles) {
        Object.assign(ROLES, patches.roles);
        const roles = ROLES;

        const moderator: {[key: string]: boolean} = {}, admin: {[key: string]: boolean} = {}, root: {[key: string]: boolean} = {};
        for (let rootID of roles.root) moderator[rootID] = admin[rootID] = root[rootID] = true;
        for (let adminID of roles.admin) moderator[adminID] = admin[adminID] = true;
        for (let moderatorID of roles.moderator) moderator[moderatorID] = true;
        Object.assign(ROLES_INCLUSIVE, {moderator, admin, root});
    }
}