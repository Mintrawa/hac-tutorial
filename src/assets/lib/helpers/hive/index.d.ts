/**
 *
 * ACCOUNT
 *
 */
export declare type CLAIM_ACCOUNT = [
    "claim_account",
    {
        "fee": string;
        "creator": string;
        "extensions": [];
    }
];
export declare type ACCOUNT_UPDATE = [
    "account_update",
    {
        "account": string;
        "owner": {
            "weight_threshold": number;
            "account_auths": [[string, number]] | [];
            "key_auths": [[string, number]];
        };
        "active": {
            "weight_threshold": number;
            "account_auths": [[string, number]] | [];
            "key_auths": [[string, number]];
        };
        "posting": {
            "weight_threshold": number;
            "account_auths": [[string, number]] | [];
            "key_auths": [[string, number]];
        };
        "memo_key": string;
        "json_metadata": string;
        "extensions": [];
    }
];
export declare type ACCOUNT_UPDATE2 = [
    "account_update2",
    {
        "account": string;
        "posting_json_metadata": string;
        "json_metadata": "";
        "extensions": [];
    }
];
/**
 *
 * COMMENT
 *
 */
export declare type COMMENT = [
    "comment",
    {
        "author": string;
        "title": string;
        "body": string;
        "parent_author": string;
        "parent_permlink": string;
        "permlink": string;
        "json_metadata": string;
    }
];
export declare type DELETE_COMMENT = [
    "delete_comment",
    {
        "author": string;
        "permlink": string;
    }
];
export declare type VOTE = [
    "vote",
    {
        "voter": string;
        "author": string;
        "permlink": string;
        "weight": number;
    }
];
/**
 *
 * WALLET
 *
 */
export declare type TRANSFER = [
    "transfer",
    {
        "from": string;
        "to": string;
        "amount": string;
        "memo": string;
    }
];
export declare type TRANSFER_TO_VESTING = [
    "transfer_to_vesting",
    {
        "from": string;
        "to": string;
        "amount": string;
    }
];
export declare type WITHDRAW_VESTING = [
    "withdraw_vesting",
    {
        "account": string;
        "vesting_shares": string;
    }
];
export declare type DELEGATE_VESTING_SHARES = [
    "delegate_vesting_shares",
    {
        "delegator": string;
        "delegatee": string;
        "vesting_shares": string;
    }
];
export declare type CONVERT = [
    "convert" | "collateralized_convert",
    {
        "owner": string;
        "requestid": number;
        "amount": string;
    }
];
/**
 *
 * WITNESSES
 *
 */
export declare type ACCOUNT_WITNESS_VOTE = [
    "account_witness_vote",
    {
        "account": string;
        "witness": string;
        "approve": boolean;
    }
];
export declare type ACCOUNT_WITNESS_PROXY = [
    "account_witness_proxy",
    {
        "account": string;
        "proxy": string;
    }
];
export declare type WITNESS_SET_PROPERTIES = [
    "witness_set_properties",
    {
        "owner": string;
        "props": {
            "account_creation_fee": string;
            "account_subsidy_budget": number;
            "account_subsidy_decay": number;
            "maximum_block_size": number;
            "hbd_interest_rate": string;
            "hbd_exchange_rate": {
                "base": string;
                "quote": string;
            };
            "url": string;
            "new_signing_key": string;
        };
        "extensions": [];
    }
];
export declare type WITNESS_UPDATE = [
    "witness_update",
    {
        "owner": string;
        "url": string;
        "block_signing_key": string;
        "props": {
            "account_creation_fee": {
                "amount": string;
                "precision": number;
                "nai": "@@000000021";
            };
            "maximum_block_size": number;
            "hbd_interest_rate": number;
        };
        "fee": {
            "amount": string;
            "precision": number;
            "nai": "@@000000021";
        };
    }
];
export declare type OPERATION = any;
