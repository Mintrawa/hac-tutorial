"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.keychainSignTx = exports.keychainBroadcast = exports.keychainSignBuffer = exports.keychainCheck = exports.keychain = void 0;
/** Hive Authentication Client */
const index_1 = require("./index");
/** Hive Authentication Services */
const has_1 = require("./has");
/**
 *
 * HIVE KEYCHAIN BROWSER EXTENSION
 *
 */
exports.keychain = false;
/**
 * [KEYCHAIN] Check if installed
 * @param { number } ms - delay (ms) before execute
 */
const keychainCheck = (ms) => {
    setTimeout(async () => {
        if (window.hive_keychain) {
            window.hive_keychain.requestHandshake(() => {
                exports.keychain = true;
                if (sessionStorage.getItem("hasmode"))
                    console.log('%c[KEYCHAIN Handshake]', 'color: blueviolet', 'Check Keychain', exports.keychain);
                index_1.hacMsg.next({ type: "keychainStatus", msg: exports.keychain ? "active" : "not installed" });
            });
        }
        else {
            index_1.hacMsg.next({ type: "keychainStatus", msg: "not installed" });
        }
    }, ms);
};
exports.keychainCheck = keychainCheck;
/**
 * [KEYCHAIN] Sign a msg
 * @param { string } account - Hive account to use to sign the message
 * @param { string } msg - message to sign
 * @param { "Active"|"Posting"|"Memo" } key - Hive private key to use to sign the message
 * @param { number } ms - delay (ms) before execute
 */
const keychainSignBuffer = (account, msg, key, ms) => {
    setTimeout(() => {
        window.hive_keychain.requestSignBuffer(account, msg, key, (response) => {
            if (sessionStorage.getItem("hasmode"))
                console.log('%c[KEYCHAIN Sign Buffer]', 'color: blueviolet', response);
            if (response.success) {
                const a = (0, has_1.hasGetAccount)();
                if (!a)
                    (0, index_1.hacAddAccount)({ account, hkc: true, challenge: { value: msg, signature: response.result } });
                const authentified = {
                    type: "authentication",
                    msg: {
                        status: "authentified",
                        data: {
                            challenge: response.result
                        }
                    }
                };
                index_1.hacMsg.next(authentified);
            }
            else {
                const authentified = {
                    type: "authentication",
                    msg: {
                        status: "rejected",
                        data: {
                            challenge: response.message
                        }
                    }
                };
                index_1.hacMsg.next(authentified);
            }
        });
    }, ms);
};
exports.keychainSignBuffer = keychainSignBuffer;
/* Request to Broadcast operation */
const keychainBroadcast = (account, operations, key, ms) => {
    if (!(0, has_1.hasGetAccount)())
        throw new Error('User not connected');
    setTimeout(() => {
        window.hive_keychain.requestBroadcast(account, operations, key, (response) => {
            if (sessionStorage.getItem("hasmode"))
                console.log('%c[KEYCHAIN Broadcast]', 'color: blueviolet', response);
            if (response.success) {
                const tx_result = {
                    type: "tx_result",
                    msg: {
                        status: "accepted",
                        data: response.result
                    }
                };
                index_1.hacMsg.next(tx_result);
            }
            else {
                const tx_result = {
                    type: "tx_result",
                    msg: {
                        status: "rejected",
                        data: response.message
                    }
                };
                index_1.hacMsg.next(tx_result);
            }
        });
    }, ms);
};
exports.keychainBroadcast = keychainBroadcast;
/* Request to sign a transaction */
const keychainSignTx = (account, tx, key, ms) => {
    return new Promise(resolve => setTimeout(() => {
        window.hive_keychain.requestSignTx(account, tx, key, (response) => {
            resolve(response);
        });
    }, ms));
};
exports.keychainSignTx = keychainSignTx;
//# sourceMappingURL=keychain.js.map