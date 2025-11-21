import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const CLIENT_ID = process.env.DOKU_CLIENT_ID!;
const SECRET_KEY = process.env.DOKU_SECRET_KEY!; // Pakai SECRET KEY untuk v2

if (!CLIENT_ID || !SECRET_KEY) {
  throw new Error("DOKU_CLIENT_ID atau DOKU_SECRET_KEY tidak ditemukan.");
}

/** DOKU Snap requires ISO 8601 timestamp */
function dokuTimestamp() {
  return new Date().toISOString();
}

/**
 * Build headers untuk DOKU Snap (v2)
 * Menggunakan HMAC-SHA256 dengan Secret Key
 */
export function buildDokuSnapHeaders({
  requestTarget,
  body,
  method = "POST",
  clientId = CLIENT_ID,
  secretKey = SECRET_KEY,
}: {
  requestTarget: string;
  body: any;
  method?: string;
  clientId?: string;
  secretKey?: string;
}) {
  const requestId = uuidv4();
  const requestTimestamp = dokuTimestamp();

  // 1. Digest SHA-256 Base64
  const bodyString = JSON.stringify(body);
  const digest = crypto
    .createHash("sha256")
    .update(bodyString, "utf-8")
    .digest("base64");

  // 2. Component Signature (sesuai DOKU Snap spec)
  const componentSignature = 
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${requestTarget}`;

  // 3. String to Sign
  const stringToSign = 
    `${method}:${requestTarget}:${digest}:${requestTimestamp}`;

  // 4. HMAC SHA-256 dengan Secret Key
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(stringToSign, "utf-8")
    .digest("base64");

  console.log("=== DOKU Snap v2 Debug ===");
  console.log("Client-Id:", clientId);
  console.log("Request-Id:", requestId);
  console.log("Timestamp:", requestTimestamp);
  console.log("Method:", method);
  console.log("Path:", requestTarget);
  console.log("Digest:", digest);
  console.log("String to Sign:", stringToSign);
  console.log("Signature:", signature);

  return {
    requestId,
    headers: {
      "Content-Type": "application/json",
      "X-CLIENT-KEY": clientId,
      "X-SIGNATURE": signature,
      "X-TIMESTAMP": requestTimestamp,
      "X-PARTNER-ID": clientId,
    },
  };
}

/**
 * Generate signature untuk notification/callback
 */
export function verifyDokuCallback(
  requestBody: string,
  timestamp: string,
  signature: string,
  secretKey: string = SECRET_KEY
): boolean {
  const stringToSign = `${requestBody}:${timestamp}`;
  
  const calculatedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(stringToSign, "utf-8")
    .digest("base64");

  return calculatedSignature === signature;
}