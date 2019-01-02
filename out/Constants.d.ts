import { RoleOptions } from ".";
declare namespace Constants {
    let SUCCESS_EMOJI: string;
    let FAIL_EMOJI: string;
    let WARNING_EMOJI: string;
    let DELETE_EMOJI: string;
    let COMMAND_PREFIX: string;
    let ARGUMENT_REGEX: RegExp;
    let BOT_ICON: string;
    let BOT_AUTHOR: string;
    let TEMP_DIR: string;
    let COLORS: {
        DANGER: number;
    };
    enum ErrorFormat {
        EMBED = 0,
        TEXT = 1
    }
    let ERROR_RENDER_FORMAT: ErrorFormat;
    let ROLES: RoleOptions;
    const ERROR_PREFIX = "**Uh oh!**";
    interface PatchableConstants {
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
    /**
     * Applies patches to BotKit constants
     * @param patches the patches to apply
     */
    function applyPatches(patches: Partial<PatchableConstants>): void;
}
export default Constants;
