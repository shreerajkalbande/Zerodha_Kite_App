import { KiteConnect } from "kiteconnect";

const apiKey = process.env.KITE_API_KEY;
const apiSecret = process.env.KITE_API_SECRET;
const requestToken = process.env.KITE_REQUEST_TOKEN;

if (!apiKey || !apiSecret || !requestToken) {
  console.error("Missing required environment variables. Please check .env file.");
  process.exit(1);
}

const kc = new KiteConnect({ api_key: apiKey });

console.log("Login URL:", kc.getLoginURL());

async function generateSession() {
  const response = await kc.generateSession(requestToken, apiSecret);
  kc.setAccessToken(response.access_token);
  console.log("Session generated successfully");
  return response.access_token;
}

async function getProfile() {
  const profile = await kc.getProfile();
  console.log("Profile:", profile);
  return profile;
}

async function main() {
  try {
    await generateSession();
    await getProfile();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();