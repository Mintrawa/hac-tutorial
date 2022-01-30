import { HAS_STATUS, HAS_APP } from './helpers/has';
import { HAC_PREVIOUS_CONNECTION } from './helpers/hac';
/** [HAS] Get the status of the connection */
export declare const hasGetConnectionStatus: () => HAS_STATUS | null;
/** [HAS] Get the account */
export declare const hasGetAccount: () => HAC_PREVIOUS_CONNECTION;
/** [HAS] Set the account */
export declare const hasSetAccount: (account: HAC_PREVIOUS_CONNECTION) => void;
/**
 * [HAS] Connect via websocket to Hive Authentication Services
 * @param { string[] } [ hasServer ] - list of websocket url of HAS server
 */
export declare const HiveAuthService: (hasServers?: string[] | undefined) => void;
/**
 * [SEND] an authentication request to the Hive Authentication Services via websocket
 * @param { string } account
 * @param app
 * @param { key_type: "active"|"posting", value: string } challenge
 */
export declare const hasSendAuthReq: (account: string, app: HAS_APP, challenge: {
    key_type: "active" | "posting";
    value: string;
}) => void;
/**
* [SEND] a Sign request
* @param { string } account
* @param { string } token
* @param { key_type: 'active'|'posting'|'memo', ops: string, broadcast: boolean } ops
* @param { string } auth_key
*/
export declare const sendSignReq: (account: string, ops: {
    key_type: "owner" | "active" | "posting" | "memo";
    ops: any;
    broadcast: boolean;
}) => void;
