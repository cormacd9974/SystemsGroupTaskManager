const REQUIRED = ["MONGO_URI", "JWT_SECRET"];
const EMAIL = ["EMAIL_HOST", "EMAIL_USER", "EMAIL_PASS", "EMAIL_FROM", "APP_URL"];
export const validateEnv = () => {
    const missing = REQUIRED.filter((key) => !process.env[key]);
    if(missing.length) {
        console.error(`FATAL: missing or required env vars: ${missing.join(", ")}` );
        process.exit(1);
    }
    const missingEmail = EMAIL.filter((key) => !process.env[key]);
    if(missingEmail.length) {
        console.warn(`WARNING: email features disabled, missing: ${missing.join(", ")}` );
    }
}