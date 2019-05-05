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
    const ERROR_PREFIX = "**Uh oh!**";
    interface PatchableConstants {
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
    function applyPatches(patches: Partial<PatchableConstants>): void;
}
export default Constants;
