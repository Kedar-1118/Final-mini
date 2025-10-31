import crypto from "crypto";

const ALGORITHM = process.env.CRYPTO_ALGORITHM || "aes-256-gcm";
const SECRET_KEY = Buffer.from(process.env.CRYPTO_SECRET_KEY, "base64");
const IV_LENGTH = 16;

if (SECRET_KEY.length !== 32) {
    throw new Error(
        "CRYPTO_SECRET_KEY must be a 32-byte key (256 bits). Check your .env setup."
    );
}

export function encrypt(text) {
    if (!text) return null;

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    return [
        iv.toString("base64"),
        Buffer.from(encrypted, "hex").toString("base64"),
        authTag.toString("base64"),
    ].join(":");
}

export function decrypt(encryptedText) {
    if (!encryptedText) return null;

    try {
        const parts = encryptedText.split(":");
        if (parts.length !== 3) {
            throw new Error("Invalid encryption format.");
        }

        const iv = Buffer.from(parts[0], "base64");
        const encrypted = Buffer.from(parts[1], "base64").toString("hex");
        const authTag = Buffer.from(parts[2], "base64");
        const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        console.error(
            "Decryption failed. Data may be corrupt or key is wrong.",
            error.message
        );
        return null;
    }
}
