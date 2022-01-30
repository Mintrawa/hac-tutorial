/** RXJS */
import { Subject } from 'rxjs';
/** Hive Authentication Client */
import { HAC_MODULE, HAC_STATUS, HAC_PREVIOUS_CONNECTION, HAC_MESSAGE } from './helpers/hac';
import { HAS_APP } from './helpers/has';
import { OPERATION } from './helpers/hive';
/**
 * Hive Auth Client RxJS messaging
 */
export declare const hacMsg: Subject<HAC_MESSAGE>;
/**
 * [HAC] Main Function => Hive Auth Client
 * @param { string[] } [ hasServer ] - list of websocket url of HAS server
 * @param { debug?:boolean, delay?: number } [ options ] - options
 * @returns void
 */
export declare const HiveAuthClient: (hasServer?: string[] | undefined, options?: {
    debug?: boolean | undefined;
    delay?: number | undefined;
} | undefined) => void;
export declare const hacGetConnectionStatus: () => HAC_STATUS;
/**
 * [HAC] Get all or one specific connection info
 * @param { string } [account] - Account to retrieve
 * @param { string } [pwd] - Password to use to decrypt localStorage
 * @returns HAC_PREVIOUS_CONNECTION[]
 */
export declare const hacGetAccounts: (account?: string | undefined, pwd?: string | undefined) => HAC_PREVIOUS_CONNECTION[];
/**
 * [HAC] Add or Update account
 * @param { HAC_PREVIOUS_CONNECTION } account
 * @returns void
 */
export declare const hacAddAccount: (account: HAC_PREVIOUS_CONNECTION) => void;
/**
 * [HAC] Remove an account
 * @param { string } account
 * @param { string } [pwd]
 * @returns boolean
 */
export declare const hacRemoveAccount: (account: string) => boolean;
/**
 * [HAC] Check password
 * @param { string } pwd
 * @returns boolean
 */
export declare const hacCheckPwd: (pwd: string) => boolean;
/**
 * HAC User Authentication
 * @param { string }     account - Hive User to connect
 * @param { HAS_APP }    app - App
 * @param { string }     pwd - Password to use to encrypt localStorage
 * @param { string }     challenge - String to sign with Hive User private key
 * @param { HAC_MODULE } [m] - Module to use (has, keychain)
 * @returns void
 */
export declare const hacUserAuth: (account: string, app: HAS_APP, pwd: string, challenge: {
    key_type: "active" | "posting";
    value: string;
}, m?: HAC_MODULE | undefined) => void;
/*****************************
 *
 * OPERATIONS
 *
 */
/**
 * HAC Send a Manual Transaction
 * @param { "owner"|"active"|"posting" } key_type
 * @param { OPERATION } op
 */
export declare const hacManualTransaction: (key_type: "owner" | "active" | "posting" | "memo", op: OPERATION) => void;
/**
 * HAC Claim a free account
 */
export declare const hacClaimAccount: () => void;
/**
 * Follow/UnFollow a user
 * @param { string } account
 * @param { string } following
 * @param { boolean } follow
 */
export declare const hacFollowing: (following: string, follow: boolean) => void;
/**
 * Vote/Downvote a user post
 * @param { string } author
 * @param { string } permlink
 * @param { number } weight
 */
export declare const hacVote: (author: string, permlink: string, weight: number) => void;
/*****************************
 *
 * OPERATIONS WALLET
 *
 */
/**
 * Transfer HIVE or HBD to another user
 * @param to
 * @param amount
 * @param currency
 * @param memo
 */
export declare const hacTransfer: (to: string, amount: string, currency: "HIVE" | "HBD", memo: string) => void;
/**
 * Transfer to Vesting (Power UP)
 * @param { string } to
 * @param { string } amount
 */
export declare const hacTransferToVesting: (to: string, amount: string) => void;
/**
 * Withdraw from Vesting (Power Down)
 * @param { string } vesting_shares
 */
export declare const hacWithdrawVesting: (vesting_shares: string) => void;
/**
 * Delegate HIVE POWER to a user
 * @param { string } delegatee
 * @param { string } amount
 */
export declare const hacDelegation: (delegatee: string, vesting_shares: string) => void;
/**
 * Convert HBD => HIVE or HIVE => HBD
 * @param { string } amount
 * @param { "HIVE"|"HBD" } currency
 */
export declare const hacConvert: (amount: string, currency: "HIVE" | "HBD") => void;
/*****************************
 *
 * OPERATIONS WITNESS
 *
 */
/**
 * Approve/Disapprove a witness
 * @param { string } witness
 * @param { boolean } approve
 */
export declare const hacWitnessVote: (witness: string, approve: boolean) => void;
/**
 * Set a proxy as Witness
 * @param { string } proxy
 */
export declare const hacWitnessProxy: (proxy: string) => void;
export { hasGetConnectionStatus } from "./has";
export { HAC_PREVIOUS_CONNECTION, HAC_KEYCHAIN_STATUS, HAC_MSG_QR_CODE, HAC_MSG_AUTHENTICATION, HAC_MSG_SIGN_WAIT, HAC_MSG_TX_RESULT } from './helpers/hac';
