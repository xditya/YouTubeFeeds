import { config } from "dotenv";
import { cleanEnv, str } from "envalid";

await config({ export: true });

export default cleanEnv(Deno.env.toObject(), {
  BOT_TOKEN: str(),
  OWNERS: str(),
  REDIS_URL: str(),
  REDIS_PASSWORD: str(),
  CHANNEL_ID: str(),
  CHATS: str(),
  TIME_DELAY: str(),
});
