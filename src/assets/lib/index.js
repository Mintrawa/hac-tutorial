"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasGetConnectionStatus = exports.hacWitnessProxy = exports.hacWitnessVote = exports.hacConvert = exports.hacDelegation = exports.hacWithdrawVesting = exports.hacTransferToVesting = exports.hacTransfer = exports.hacVote = exports.hacFollowing = exports.hacClaimAccount = exports.hacManualTransaction = exports.hacUserAuth = exports.hacCheckPwd = exports.hacRemoveAccount = exports.hacAddAccount = exports.hacGetAccounts = exports.hacGetConnectionStatus = exports.HiveAuthClient = exports.hacMsg = void 0;
/** RXJS */
const rxjs_1 = require("rxjs");
/** Encrytion */
const crypto_js_1 = __importDefault(require("crypto-js"));
const aes_1 = __importDefault(require("crypto-js/aes"));
/** Hive Authentication Service */
const has_1 = require("./has");
/** Hive Keychain */
const keychain_1 = require("./keychain");
/** Internal fonction */
const firstCharUpper = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
};
/**
 *
 * HIVE AUTH CLIENT
 *
 */
/** Default value */
let keychainDelay = 200;
let hacModule = "has";
/** HAC accounts history */
let hacAccounts = [];
let hacPwd;
let username;
/**
 * Hive Auth Client RxJS messaging
 */
exports.hacMsg = new rxjs_1.Subject();
/**
 * [HAC] Main Function => Hive Auth Client
 * @param { string[] } [ hasServer ] - list of websocket url of HAS server
 * @param { debug?:boolean, delay?: number } [ options ] - options
 * @returns void
 */
const HiveAuthClient = (hasServer, options) => {
    if (options) {
        sessionStorage.removeItem("hasmode");
        if (options.debug)
            sessionStorage.setItem("hasmode", "debug");
        if (options.delay)
            keychainDelay = options.delay;
    }
    /** Start HiveAuthService */
    hasServer ? (0, has_1.HiveAuthService)(hasServer) : (0, has_1.HiveAuthService)();
    /** Check Hive Keychain browser extension */
    (0, keychain_1.keychainCheck)(keychainDelay);
};
exports.HiveAuthClient = HiveAuthClient;
const hacGetConnectionStatus = () => {
    const status = {
        keychain: keychain_1.keychain,
        has: (0, has_1.hasGetConnectionStatus)()
    };
    return status;
};
exports.hacGetConnectionStatus = hacGetConnectionStatus;
/**
 * [HAC] Get all or one specific connection info
 * @param { string } [account] - Account to retrieve
 * @param { string } [pwd] - Password to use to decrypt localStorage
 * @returns HAC_PREVIOUS_CONNECTION[]
 */
const hacGetAccounts = (account, pwd) => {
    try {
        if (pwd && typeof (pwd) !== "string")
            throw new Error("Password need to be a string");
        if (!pwd && typeof (hacPwd) !== "string")
            throw new Error("No Password yet");
        if (account && typeof (account) !== "string")
            throw new Error("Account is not a valid string");
        /** if password OK */
        if ((0, exports.hacCheckPwd)(pwd ? pwd : hacPwd)) {
            if (pwd)
                hacPwd = pwd;
            /** Decrypt Accounts */
            const a = localStorage.getItem('hac') ? localStorage.getItem('hac') : undefined;
            hacAccounts = a ? JSON.parse(aes_1.default.decrypt(a.substring(64), hacPwd).toString(crypto_js_1.default.enc.Utf8)) : [];
            /** Check expired for account via HAS and remove them */
            for (const [i, acc] of hacAccounts.entries()) {
                if (acc.has && acc.has.has_expire && acc.has.has_expire < Date.now())
                    hacAccounts.splice(i, 1);
            }
            const enc = aes_1.default.encrypt(JSON.stringify(hacAccounts), hacPwd).toString();
            const hmac = crypto_js_1.default.HmacSHA256(enc, crypto_js_1.default.SHA256(hacPwd)).toString();
            localStorage.setItem('hac', hmac + enc);
            if (sessionStorage.getItem("hasmode"))
                console.log('%c[HAC Accounts]', 'color: deeppink', hacAccounts);
            /** If search specific account */
            if (account) {
                const lycos = hacAccounts.find(a => a.account === account);
                if (lycos) {
                    (0, has_1.hasSetAccount)(lycos);
                    username = lycos.account;
                }
                if (lycos && lycos.hkc) {
                    hacModule = "keychain";
                }
                else {
                    hacModule = "has";
                }
                return (0, has_1.hasGetAccount)() ? [(0, has_1.hasGetAccount)()] : [];
                /** Return all accounts */
            }
            else {
                return hacAccounts;
            }
        }
        else {
            localStorage.removeItem('hac');
            return [];
        }
    }
    catch (e) {
        if (sessionStorage.getItem("hasmode"))
            console.error(e);
        return [];
    }
};
exports.hacGetAccounts = hacGetAccounts;
/**
 * [HAC] Add or Update account
 * @param { HAC_PREVIOUS_CONNECTION } account
 * @returns void
 */
const hacAddAccount = (account) => {
    if (typeof (hacPwd) !== "string")
        throw new Error("No Password yet");
    username = account.account;
    (0, has_1.hasSetAccount)(account);
    const lycos = hacAccounts.findIndex(a => a.account === account.account);
    if (lycos > -1) {
        hacAccounts[lycos] = account;
    }
    else {
        hacAccounts.push(account);
    }
    const enc = aes_1.default.encrypt(JSON.stringify(hacAccounts), hacPwd).toString();
    const hmac = crypto_js_1.default.HmacSHA256(enc, crypto_js_1.default.SHA256(hacPwd)).toString();
    localStorage.setItem('hac', hmac + enc);
};
exports.hacAddAccount = hacAddAccount;
/**
 * [HAC] Remove an account
 * @param { string } account
 * @param { string } [pwd]
 * @returns boolean
 */
const hacRemoveAccount = (account) => {
    try {
        if (account && typeof (account) !== "string")
            throw new Error("Account is not a valid string");
        if (hacAccounts.length === 0)
            throw new Error("No account in array");
        /** Search account index in array */
        const lycos = hacAccounts.findIndex(a => a.account === account);
        hacAccounts.splice(lycos, 1);
        /** if no account in array delete localStorage */
        if (hacAccounts.length === 0) {
            localStorage.removeItem('hac');
        }
        else {
            const enc = aes_1.default.encrypt(JSON.stringify(hacAccounts), hacPwd).toString();
            const hmac = crypto_js_1.default.HmacSHA256(enc, crypto_js_1.default.SHA256(hacPwd)).toString();
            localStorage.setItem('hac', hmac + enc);
        }
        return true;
    }
    catch (e) {
        if (sessionStorage.getItem("hasmode"))
            console.error(e);
        throw new Error("Something went wrong when tryin to remove the account");
    }
};
exports.hacRemoveAccount = hacRemoveAccount;
/**
 * [HAC] Check password
 * @param { string } pwd
 * @returns boolean
 */
const hacCheckPwd = (pwd) => {
    try {
        if (pwd && typeof (pwd) !== "string")
            throw new Error("Password need to be a string");
        /** Retrieve accounts stored */
        const a = localStorage.getItem('hac') ? localStorage.getItem('hac') : undefined;
        if (a) {
            /** Check HMAC */
            const hmac = a.substring(0, 64);
            const enc = a.substring(64);
            const decryptedhmac = crypto_js_1.default.HmacSHA256(enc, crypto_js_1.default.SHA256(pwd ? pwd : hacPwd)).toString();
            /** HMAC not match the reference HMAC */
            if (decryptedhmac !== hmac) {
                return false;
                /** Both HMAC match */
            }
            else {
                return true;
            }
            /** No accounts stored yet */
        }
        else {
            throw new Error("No accounts stored yet");
        }
        /** Something went wrong */
    }
    catch (e) {
        if (sessionStorage.getItem("hasmode"))
            console.error(e);
        throw new Error("Something went wrong with the password check");
    }
};
exports.hacCheckPwd = hacCheckPwd;
/**
 * HAC User Authentication
 * @param { string }     account - Hive User to connect
 * @param { HAS_APP }    app - App
 * @param { string }     pwd - Password to use to encrypt localStorage
 * @param { string }     challenge - String to sign with Hive User private key
 * @param { HAC_MODULE } [m] - Module to use (has, keychain)
 * @returns void
 */
const hacUserAuth = (account, app, pwd, challenge, m) => {
    try {
        if (typeof (account) !== "string")
            throw new Error("Account need to be a string");
        if (typeof (pwd) !== "string")
            throw new Error("Password need to be a string");
        if (typeof (challenge.value) !== "string")
            throw new Error("Challenge value need to be a string");
        if (!challenge.key_type || (challenge.key_type !== "active" && challenge.key_type !== "posting"))
            throw new Error('Key value need to be "posting" or "active"');
        /** if previous */
        if (localStorage.getItem('hac')) {
            /** Retrieve account if known */
            const a = (0, exports.hacGetAccounts)(account, pwd);
            if (a.length === 1 && a[0].hkc) {
                hacModule = "keychain";
            }
            else {
                hacModule = "has";
            }
        }
        else {
            if (pwd)
                hacPwd = pwd;
        }
        /** If force module */
        if (m)
            hacModule = m;
        /** Auth by Hive Keychain */
        if (hacModule === "keychain")
            (0, keychain_1.keychainSignBuffer)(account, challenge.value, firstCharUpper(challenge.key_type), keychainDelay);
        /** Auth by HAS */
        if (hacModule === "has")
            (0, has_1.hasSendAuthReq)(account, app, challenge);
    }
    catch (e) {
        exports.hacMsg.next({ type: "authentication", error: { msg: e instanceof Error ? e.message : 'error' } });
    }
};
exports.hacUserAuth = hacUserAuth;
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
const hacManualTransaction = (key_type, op) => {
    if (typeof (key_type) !== "string" && !["owner", "active", "posting"].includes(key_type))
        throw new Error('Not a valid key_type');
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAC Following]', 'color: deeppink', op);
    /** Keychain */
    if (hacModule === "keychain")
        (0, keychain_1.keychainBroadcast)(username, [op], firstCharUpper(key_type), keychainDelay);
    /** HAS */
    if (hacModule === "has")
        (0, has_1.sendSignReq)(username, { key_type, ops: [op], broadcast: true });
};
exports.hacManualTransaction = hacManualTransaction;
/**
 * HAC Claim a free account
 */
const hacClaimAccount = () => {
    if (typeof (username) !== "string")
        throw new Error("No user connected yet");
    const claimAccount = ["claim_account", { fee: "0.000 HIVE", creator: username, extensions: [] }];
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAC Following]', 'color: deeppink', claimAccount);
    /** Keychain */
    if (hacModule === "keychain")
        (0, keychain_1.keychainBroadcast)(username, [claimAccount], "Active", keychainDelay);
    /** HAS */
    if (hacModule === "has")
        (0, has_1.sendSignReq)(username, { key_type: "active", ops: [claimAccount], broadcast: true });
};
exports.hacClaimAccount = hacClaimAccount;
/**
 * Follow/UnFollow a user
 * @param { string } account
 * @param { string } following
 * @param { boolean } follow
 */
const hacFollowing = (following, follow) => {
    if (typeof (username) !== "string")
        throw new Error("No user connected yet");
    const json = ["follow", { follower: username, following, what: follow ? ["blog"] : [] }];
    const custom_json = ["custom_json", { id: 'follow', json: JSON.stringify(json), required_auths: [], required_posting_auths: [username] }];
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAC Following]', 'color: deeppink', custom_json);
    /** Keychain */
    if (hacModule === "keychain")
        (0, keychain_1.keychainBroadcast)(username, [custom_json], "Posting", keychainDelay);
    /** HAS */
    if (hacModule === "has")
        (0, has_1.sendSignReq)(username, { key_type: "posting", ops: [custom_json], broadcast: true });
};
exports.hacFollowing = hacFollowing;
/**
 * Vote/Downvote a user post
 * @param { string } author
 * @param { string } permlink
 * @param { number } weight
 */
const hacVote = (author, permlink, weight) => {
    if (typeof (username) !== "string")
        throw new Error("No user connected yet");
    if (typeof (permlink) !== "string")
        throw new Error("Permlink Error");
    if (weight < -100 || weight > 100)
        throw new Error("weight need to be between -100 and 100");
    const vote = ["vote", { voter: username, author, permlink, weight: weight * 100 }];
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAC Vote]', 'color: deeppink', vote);
    /** Keychain */
    if (hacModule === "keychain")
        (0, keychain_1.keychainBroadcast)(username, [vote], "Posting", keychainDelay);
    /** HAS */
    if (hacModule === "has")
        (0, has_1.sendSignReq)(username, { key_type: "posting", ops: [vote], broadcast: true });
};
exports.hacVote = hacVote;
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
const hacTransfer = (to, amount, currency, memo) => {
    if (typeof (username) !== "string")
        throw new Error("No user connected yet");
    if (typeof (to) !== "string")
        throw new Error("recipient must be a string");
    if (typeof (amount) !== "string")
        throw new Error("amount must be a string");
    if (currency !== "HIVE" && currency !== "HBD")
        throw new Error("currency must be HIVE or HBD");
    if (typeof (memo) !== "string")
        throw new Error("memo must be a string");
    const transfer = ["transfer", { from: username, to, amount: amount.concat(" ", currency), memo }];
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAC Transfer]', 'color: deeppink', transfer);
    /** Keychain */
    if (hacModule === "keychain")
        (0, keychain_1.keychainBroadcast)(username, [transfer], "Active", keychainDelay);
    /** HAS */
    if (hacModule === "has")
        (0, has_1.sendSignReq)(username, { key_type: "active", ops: [transfer], broadcast: true });
};
exports.hacTransfer = hacTransfer;
/**
 * Transfer to Vesting (Power UP)
 * @param { string } to
 * @param { string } amount
 */
const hacTransferToVesting = (to, amount) => {
    if (typeof (username) !== "string")
        throw new Error("No user connected yet");
    if (typeof (to) !== "string")
        throw new Error("recipient must be a string");
    if (typeof (amount) !== "string")
        throw new Error("amount must be a string");
    const transferToVesting = ["transfer_to_vesting", { from: username, to, amount: amount + " HIVE" }];
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAC Transfer To Vesting]', 'color: deeppink', transferToVesting);
    /** Keychain */
    if (hacModule === "keychain")
        (0, keychain_1.keychainBroadcast)(username, [transferToVesting], "Active", keychainDelay);
    /** HAS */
    if (hacModule === "has")
        (0, has_1.sendSignReq)(username, { key_type: "active", ops: [transferToVesting], broadcast: true });
};
exports.hacTransferToVesting = hacTransferToVesting;
/**
 * Withdraw from Vesting (Power Down)
 * @param { string } vesting_shares
 */
const hacWithdrawVesting = (vesting_shares) => {
    if (typeof (username) !== "string")
        throw new Error("No user connected yet");
    if (typeof (vesting_shares) !== "string")
        throw new Error("amount must be a string");
    const withdrawVesting = ["withdraw_vesting", { account: username, vesting_shares }];
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAC Withdraw Vesting]', 'color: deeppink', withdrawVesting);
    /** Keychain */
    if (hacModule === "keychain")
        (0, keychain_1.keychainBroadcast)(username, [withdrawVesting], "Active", keychainDelay);
    /** HAS */
    if (hacModule === "has")
        (0, has_1.sendSignReq)(username, { key_type: "active", ops: [withdrawVesting], broadcast: true });
};
exports.hacWithdrawVesting = hacWithdrawVesting;
/**
 * Delegate HIVE POWER to a user
 * @param { string } delegatee
 * @param { string } amount
 */
const hacDelegation = (delegatee, vesting_shares) => {
    if (typeof (username) !== "string")
        throw new Error("No user connected yet");
    if (typeof (delegatee) !== "string")
        throw new Error("Delegatee must be a string");
    if (typeof (vesting_shares) !== "string")
        throw new Error("amount must be a string");
    const delegation = ["delegate_vesting_shares", { delegator: username, delegatee, vesting_shares }];
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAC Delegation]', 'color: deeppink', delegation);
    /** Keychain */
    if (hacModule === "keychain")
        (0, keychain_1.keychainBroadcast)(username, [delegation], "Active", keychainDelay);
    /** HAS */
    if (hacModule === "has")
        (0, has_1.sendSignReq)(username, { key_type: "active", ops: [delegation], broadcast: true });
};
exports.hacDelegation = hacDelegation;
/**
 * Convert HBD => HIVE or HIVE => HBD
 * @param { string } amount
 * @param { "HIVE"|"HBD" } currency
 */
const hacConvert = (amount, currency) => {
    if (typeof (username) !== "string")
        throw new Error("No user connected yet");
    if (typeof (amount) !== "string")
        throw new Error("amount must be a string");
    //create random number for requestid paramter
    const requestid = Math.floor(Math.random() * 10000000);
    const convert = [currency === "HBD" ? "convert" : "collateralized_convert", { owner: username, requestid, amount: amount.concat(" ", currency) }];
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAC Convert]', 'color: deeppink', convert);
    /** Keychain */
    if (hacModule === "keychain")
        (0, keychain_1.keychainBroadcast)(username, [convert], "Active", keychainDelay);
    /** HAS */
    if (hacModule === "has")
        (0, has_1.sendSignReq)(username, { key_type: "active", ops: [convert], broadcast: true });
};
exports.hacConvert = hacConvert;
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
const hacWitnessVote = (witness, approve) => {
    if (typeof (username) !== "string")
        throw new Error("No user connected yet");
    if (typeof (witness) !== "string")
        throw new Error("Witness Error");
    if (typeof (approve) !== "boolean")
        throw new Error("Approve Error");
    const witnessVote = ["account_witness_vote", { account: username, witness, approve }];
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAC Vote Witness]', 'color: deeppink', witnessVote);
    /** Keychain */
    if (hacModule === "keychain")
        (0, keychain_1.keychainBroadcast)(username, [witnessVote], "Active", keychainDelay);
    /** HAS */
    if (hacModule === "has")
        (0, has_1.sendSignReq)(username, { key_type: "active", ops: [witnessVote], broadcast: true });
};
exports.hacWitnessVote = hacWitnessVote;
/**
 * Set a proxy as Witness
 * @param { string } proxy
 */
const hacWitnessProxy = (proxy) => {
    if (typeof (username) !== "string")
        throw new Error("No user connected yet");
    if (typeof (proxy) !== "string")
        throw new Error("Proxy Error");
    const witnessProxy = ["account_witness_proxy", { account: username, proxy }];
    if (sessionStorage.getItem("hasmode"))
        console.log('%c[HAC Witness Proxy]', 'color: deeppink', witnessProxy);
    /** Keychain */
    if (hacModule === "keychain")
        (0, keychain_1.keychainBroadcast)(username, [witnessProxy], "Active", keychainDelay);
    /** HAS */
    if (hacModule === "has")
        (0, has_1.sendSignReq)(username, { key_type: "active", ops: [witnessProxy], broadcast: true });
};
exports.hacWitnessProxy = hacWitnessProxy;
var has_2 = require("./has");
Object.defineProperty(exports, "hasGetConnectionStatus", { enumerable: true, get: function () { return has_2.hasGetConnectionStatus; } });
//# sourceMappingURL=index.js.map