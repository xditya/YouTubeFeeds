import { bot } from "./bot.ts";

bot.start({
  drop_pending_updates: true,
  allowed_updates: ["message", "callback_query"],
});
console.log(`Started @${bot.botInfo.username}`);

Deno.addSignalListener("SIGINT", () => bot.stop());
if (Deno.build.os != "windows") {
  Deno.addSignalListener("SIGTERM", () => bot.stop());
}
