"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSignReq = exports.hasSendAuthReq = exports.HiveAuthService = exports.hasSetAccount = exports.hasGetAccount = exports.hasGetConnectionStatus = void 0;
/** Require */
const uuid_1 = require("uuid");
const crypto_js_1 = __importDefault(require("crypto-js"));
const aes_1 = __importDefault(require("crypto-js/aes"));
const buffer_1 = require("buffer");
/** RXJS */
const webSocket_1 = require("rxjs/webSocket");
/** Hive Authentication Client */
const _1 = require("./");
/**
 *
 * HIVE AUTHENTICATION SERVICES
 *
 */
let socket$;
/** HAS default servers */
let has = ["wss://hive-auth.arcange.eu"];
let hasIndex = 0;
let hasTry = 0;
/** HAS status */
let hasStatus;
let hasAccount;
let hasPreAuth;
let uuid;
let expire;
let hasKey;
/** [HAS] Get the status of the connection */
const hasGetConnectionStatus = () => {
    return hasStatus ? hasStatus : null;
};
exports.hasGetConnectionStatus = hasGetConnectionStatus;
/** [HAS] Set the status of the connection */
const hasSetConnectedStatus = (has) => {
    hasStatus = {
        status: "connected",
        ping_rate: has.ping_rate,
        protocol: has.protocol,
        server: has.server,
        socketid: has.socketid,
        timeout: has.timeout,
        version: has.version
    };
};
/** [HAS] Get the account */
const hasGetAccount = () => {
    return hasAccount;
};
exports.hasGetAccount = hasGetAccount;
/** [HAS] Set the account */
const hasSetAccount = (account) => {
    hasAccount = account;
    if (hasAccount.has)
        hasKey = hasAccount.has.auth_key;
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAS Set Account]', 'color: seagreen', hasAccount);
};
exports.hasSetAccount = hasSetAccount;
/**
 * [HAS] Connect via websocket to Hive Authentication Services
 * @param { string[] } [ hasServer ] - list of websocket url of HAS server
 */
const HiveAuthService = (hasServers) => {
    if (hasServers)
        has = hasServers;
    socket$ = (0, webSocket_1.webSocket)(has[hasIndex]);
    socket$.subscribe({
        next: (recv_msg) => {
            if (typeof (recv_msg) !== 'object' || !recv_msg.cmd)
                throw new Error(`HAS: invalid data received`);
            if (sessionStorage.getItem("hasmode"))
                console.log('%c[HAS RECV]', 'color: seagreen', recv_msg);
            switch (recv_msg.cmd) {
                /** Connected to the HAS */
                case 'connected':
                    hasSetConnectedStatus(recv_msg);
                    hasTry = 0;
                    break;
                /** Waiting validation by the PKSA */
                case 'auth_wait':
                    recvAuthWait(recv_msg);
                    break;
                /** Authentication approval */
                case 'auth_ack':
                    recvAuthAck(recv_msg);
                    break;
                /** Authentication refused */
                case 'auth_nack':
                    recvAuthNack(recv_msg);
                    break;
                /** Waiting validation by the PKSA of the Sign request */
                case 'sign_wait':
                    recvSignWait(recv_msg);
                    break;
                /** Sign request approved */
                case 'sign_ack':
                    recvSignAck(recv_msg);
                    break;
                /** Sign request refused */
                case 'sign_nack':
                    recvSignNack(recv_msg);
                    break;
                /** Sign request error */
                case 'sign_err':
                    recvSignErr(recv_msg);
                    break;
                default:
                    break;
            }
        },
        /** Restart websocket if error (try another HAS server if available) */
        error: () => {
            hasTry++;
            if (hasStatus)
                hasStatus.status = "disconnected";
            if (sessionStorage.getItem("hasmode"))
                console.log('%c[HAS] error websocket!', 'color: crimson');
            hasIndex = typeof (has[hasIndex++]) === "string" ? hasIndex++ : 0;
            if (hasTry < 10) {
                setTimeout(() => {
                    (0, exports.HiveAuthService)();
                }, 250);
            }
        },
        complete: () => {
            hasStatus.status = "disconnected";
        }
    });
};
exports.HiveAuthService = HiveAuthService;
/**
 * [SEND] an authentication request to the Hive Authentication Services via websocket
 * @param { string } account
 * @param app
 * @param { key_type: "active"|"posting", value: string } challenge
 */
const hasSendAuthReq = (account, app, challenge) => {
    if (!socket$)
        throw new Error(`No connection to HAS`);
    const auth_data = {
        app,
        challenge: {
            key_type: challenge.key_type,
            challenge: challenge.value
        }
    };
    if (!hasAccount || !hasAccount.has)
        hasKey = (0, uuid_1.v4)();
    if (hasAccount && hasAccount.has)
        hasKey = hasAccount.has.auth_key;
    const enc = aes_1.default.encrypt(JSON.stringify(auth_data), hasKey).toString();
    const auth_req = { cmd: "auth_req", token: auth_data.token, account, data: enc };
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAS SEND]', 'color: dodgerblue', auth_req);
    socket$.next(auth_req);
    hasPreAuth = { account, challenge: challenge.value };
};
exports.hasSendAuthReq = hasSendAuthReq;
/**
* [RECV] an Authentication waiting (auth_wait)
* @param recv_msg
* @param auth_key
*/
const recvAuthWait = (recv_msg) => {
    uuid = recv_msg.uuid;
    /** Prepare the data for the QRcode */
    const json = JSON.stringify({
        account: recv_msg.account,
        uuid: uuid,
        key: hasKey,
        host: has[hasIndex]
    });
    /** [HAC MSG] Emit a qrCode msg (qr_code) */
    _1.hacMsg.next({
        type: 'qr_code',
        msg: buffer_1.Buffer.from(json).toString('base64')
    });
};
/**
* [RECV] an Authentication ack (auth_ack)
* @param recv_msg
*/
const recvAuthAck = (recv_msg) => {
    try {
        /** decode the encrypted data */
        const data = JSON.parse(aes_1.default.decrypt(recv_msg.data, hasKey).toString(crypto_js_1.default.enc.Utf8));
        const challenge = data.challenge ? data.challenge.challenge : '';
        /** [HAC MSG] Emit an authentication msg */
        _1.hacMsg.next({
            type: "authentication",
            msg: {
                status: "authentified",
                data: {
                    challenge,
                    has_token: data.token,
                    has_expire: data.expire,
                    has_server: has[hasIndex]
                }
            }
        });
        /** Update hasAccount */
        (0, _1.hacAddAccount)({
            account: hasPreAuth.account,
            has: {
                auth_key: hasKey,
                has_token: data.token,
                has_expire: data.expire,
                has_server: has[hasIndex]
            },
            hkc: false,
            challenge: {
                value: hasPreAuth.challenge,
                signature: challenge
            }
        });
    }
    catch (e) {
        if (sessionStorage.getItem("hasmode"))
            console.error(e);
        const msg = e instanceof Error ? e.message : "Error Authentication ack (auth_ack)";
        /** [HAC MSG] Emit an authentication error msg */
        _1.hacMsg.next({ type: "authentication", error: { msg } });
    }
};
/**
* [RECV] a rejected Authentication (auth_nack)
* @param recv_msg
*/
const recvAuthNack = (recv_msg) => {
    try {
        /** decode the encrypted data */
        //const data: unknown = JSON.parse(AES.decrypt(recv_msg.data, hasKey).toString(CryptoJS.enc.Utf8))
        const data = aes_1.default.decrypt(recv_msg.data, hasKey).toString(crypto_js_1.default.enc.Utf8);
        if (sessionStorage.getItem("hasmode"))
            console.log('%cHAS auth_nack => decoded data:', 'color: darkolivegreen', data);
        /** [HAC MSG] Emit a rejected Authentication msg if uuid encrypted match the uuid */
        if (recv_msg.uuid === data)
            _1.hacMsg.next({
                type: "authentication",
                msg: {
                    status: "rejected",
                },
                error: {
                    msg: typeof (data) === "string" ? data : "rejected Authentication (auth_nack)"
                }
            });
    }
    catch (e) {
        if (sessionStorage.getItem("hasmode"))
            console.error(e);
        const msg = e instanceof Error ? e.message : "Error rejected Authentication (auth_nack)";
        /** [HAC MSG] Emit an authentication error msg */
        _1.hacMsg.next({ type: "authentication", error: { msg } });
    }
};
/**
* [SEND] a Sign request
* @param { string } account
* @param { string } token
* @param { key_type: 'active'|'posting'|'memo', ops: string, broadcast: boolean } ops
* @param { string } auth_key
*/
const sendSignReq = (account, ops) => {
    if (!socket$)
        throw new Error(`No connection to HAS`);
    if (!hasAccount || !hasAccount.account || hasAccount.account !== account)
        throw new Error(`Account not match the HAS account`);
    if (hasAccount.has && !hasAccount.has.has_token)
        throw new Error(`No token to use with HAS`);
    if (!hasKey)
        throw new Error(`No auth_key to use with HAS`);
    const enc = aes_1.default.encrypt(JSON.stringify(ops), hasKey).toString();
    const token = hasAccount.has ? hasAccount.has.has_token : '';
    const ops_req = { cmd: "sign_req", account, token, data: enc };
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAS SEND]', 'color: dodgerblue', ops_req);
    socket$.next(ops_req);
};
exports.sendSignReq = sendSignReq;
/**
* [RECV] a Sign waiting
* @param recv_msg
*/
const recvSignWait = (recv_msg) => {
    uuid = recv_msg.uuid;
    expire = recv_msg.expire;
    /** [HAC MSG] Emit an sign wait msg (sign_wait) */
    _1.hacMsg.next({
        type: "sign_wait",
        msg: {
            uuid: uuid,
            expire: expire
        }
    });
};
/**
* [RECV] a Sign ack (sign_ack)
* @param recv_msg
*/
const recvSignAck = (recv_msg) => {
    /** [HAC MSG] Emit an transaction result msg (tx_result) */
    _1.hacMsg.next({
        type: "tx_result",
        msg: {
            status: "accepted",
            uuid: recv_msg.uuid,
            broadcast: recv_msg.broadcast,
            data: recv_msg.data
        }
    });
};
/**
* [RECV] a Sign Nack (sign_nack)
* @param recv_msg
*/
const recvSignNack = (recv_msg) => {
    /** [HAC MSG] Emit an transaction result msg (tx_result) */
    _1.hacMsg.next({
        type: "tx_result",
        msg: {
            status: "rejected",
            uuid: recv_msg.uuid,
            data: recv_msg.data
        }
    });
};
/**
* [RECV] a Sign err (sign_err)
* @param recv_msg
*/
const recvSignErr = (recv_msg) => {
    /** [HAC MSG] Emit an transaction result msg (tx_result) */
    _1.hacMsg.next({
        type: "tx_result",
        msg: {
            status: "error",
            uuid: recv_msg.uuid
        },
        error: {
            msg: recv_msg.error
        }
    });
};
//# sourceMappingURL=has.js.map