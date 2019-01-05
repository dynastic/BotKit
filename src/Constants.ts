import { RoleOptions } from ".";

namespace Constants {
    export let SUCCESS_EMOJI = '🆗';

    export let FAIL_EMOJI = '❌';

    export let WARNING_EMOJI = '⚠';

    export let DELETE_EMOJI = '🗑';

    export let COMMAND_PREFIX: string = '*';

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

    export const ERROR_PREFIX = "**Uh oh!**";

    export interface PatchableConstants {
        SUCCESS_EMOJI: typeof SUCCESS_EMOJI;
        FAIL_EMOJI: typeof FAIL_EMOJI;
        WARNING_EMOJI: typeof WARNING_EMOJI;
        DELETE_EMOJI: typeof DELETE_EMOJI;
        COMMAND_PREFIX: string | ((guildID?: string) => Promise<string>);
        ARGUMENT_REGEX: typeof ARGUMENT_REGEX;
        BOT_ICON: typeof BOT_ICON;
        BOT_AUTHOR: typeof BOT_AUTHOR;
        TEMP_DIR: typeof TEMP_DIR;
        COLORS: typeof COLORS;
        ERROR_RENDER_FORMAT: ErrorFormat;
        ERROR_PREFIX: typeof ERROR_PREFIX;
    }

    /**
     * Applies patches to BotKit constants
     * @param patches the patches to apply
     */
    export function applyPatches(patches: Partial<PatchableConstants>) {
        let script = "";
        for (let key in patches) {
            script += `Constants.${key} = patches.${key} || Constants.${key};`;
        }
        eval(script);
    }
}

export default Constants;