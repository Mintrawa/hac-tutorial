export declare type CUSTOM_JSON = [
    "custom_json",
    {
        "id": string;
        "json": string;
        "required_auths": string[];
        "required_posting_auths": string[];
    }
];
export declare type FOLLOWING = [
    "follow",
    {
        "follower": string;
        "following": string;
        what: ["blog"] | [];
    }
];
