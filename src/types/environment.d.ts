declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production";
            PORT?: string;
            CHIMIMORYO_DATABASE_URI?: string;
            CHIMIMORYO_KOA_KEYS?: string;
            CHIMIMORYO_KOA_SESSION_DOMAIN?: string;
        }
    }
}

export {};
