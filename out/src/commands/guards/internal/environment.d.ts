import { CommandHandler } from "../../util";
export declare type Environment = 'dm' | 'group' | 'text' | 'voice' | 'category';
export declare const EnvironmentGuard: (env: Environment[]) => CommandHandler;
