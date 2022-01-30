/**
 *
 * HIVE KEYCHAIN BROWSER EXTENSION
 *
 */
export declare let keychain: boolean;
/**
 * [KEYCHAIN] Check if installed
 * @param { number } ms - delay (ms) before execute
 */
export declare const keychainCheck: (ms: number) => void;
/**
 * [KEYCHAIN] Sign a msg
 * @param { string } account - Hive account to use to sign the message
 * @param { string } msg - message to sign
 * @param { "Active"|"Posting"|"Memo" } key - Hive private key to use to sign the message
 * @param { number } ms - delay (ms) before execute
 */
export declare const keychainSignBuffer: (account: string, msg: string, key: "Owner" | "Active" | "Posting" | "Memo", ms: number) => void;
export declare const keychainBroadcast: (account: string, operations: any[], key: "Owner" | "Active" | "Posting" | "Memo", ms: number) => void;
export declare const keychainSignTx: (account: string, tx: any, key: 'Posting' | 'Active' | 'Memo', ms: number) => Promise<any>;
