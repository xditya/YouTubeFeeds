import config from "./env.ts";
import { Bot, GrammyError, HttpError, InlineKeyboard } from "grammy/mod.ts";
import { parseFeed } from "rss";
import { cron } from "cron";

import {
  addFeed,
  getAllFeeds,
  getLatest,
  removeFeed,
  storeLatest,
} from "./db.ts";

export const bot = new Bot(config.BOT_TOKEN);

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

await bot.init();
export default bot;
const OWNERS: number[] = [];
for (const owner of config.OWNERS.split(" ")) {
  OWNERS.push(parseInt(owner));
}

async function matchChannelId(userName: string) {
  const url = "https://www.youtube.com/" + userName;

  const res = await fetch(url);
  const text = await res.text();
  const reg = new RegExp(
    `<meta itemprop="channelId" content=\"(.*)\"><span itemprop="author"`,
  );
  const regRes = reg.exec(text);
  if (!regRes || regRes.length < 2) {
    return null;
  }
  return regRes[1];
}
const errorMsg =
  "Please provide a channel link or username.\nEg: - `/add https://www.youtube.com/channel/UCykFIBKkj5ce3SggtaYSwtQ`\n- `/add @xditya`";

bot.command("start", async (ctx) => {
  await ctx.reply(
    `
Hey ${ctx.from!.first_name}!

I'm a YouTube feeds bot. I can send you the latest videos from your favorite YouTube channels.

Please deploy your own instance of the bot to use it. Find the repository in the button below.
`,
    {
      reply_markup: new InlineKeyboard().url(
        "Repository",
        "https://github.com/xditya/YouTubeFeeds",
      ),
    },
  );
  if (OWNERS.includes(ctx.from!.id)) {
    await ctx.reply(
      "Use /add in any chat to add a feed to the chat. Use /list to view all added feeds and to remove them.",
      { parse_mode: "Markdown" },
    );
  }
});

bot
  .filter((ctx) => OWNERS.includes(ctx.from!.id))
  .command("add", async (ctx) => {
    const channelLinkOrUserName = ctx.message!.text!.split(" ")[1];
    let channelLink;
    if (!channelLinkOrUserName) {
      await ctx.reply(
        errorMsg,
        { parse_mode: "Markdown" },
      );
      return;
    }
    let channelId;
    if (!channelLinkOrUserName.startsWith("@")) {
      channelId = channelLinkOrUserName.split("/").pop();
      if (!channelId) {
        await ctx.reply(
          errorMsg,
          { parse_mode: "Markdown" },
        );
        return;
      }
      channelLink = channelLinkOrUserName;
    } else {
      const res = await matchChannelId(channelLinkOrUserName);
      if (res == null) {
        await ctx.reply(
          errorMsg,
          { parse_mode: "Markdown" },
        );
        return;
      }
      channelId = res;
      channelLink = "https://youtube.com/" + channelLinkOrUserName;
    }
    try {
      const resp = await fetch(
        "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelId,
      );
      const data = await parseFeed(await resp.text());
      const r = await addFeed(ctx.chat!.id, channelId);
      if (r) {
        await ctx.reply(
          `Added "<a href="${channelLink}">${
            data.title.value ?? "channel"
          }</a>" to the current chat. New video notifications would be posted here!`,
          { parse_mode: "HTML" },
        );
      } else {
        await ctx.reply(
          `Notifications from "<a href="${channelLink}">${
            data.title.value ?? "channel"
          }</a>" are already enabled in this chat!`,
          { parse_mode: "HTML" },
        );
      }
    } catch {
      await ctx.reply(
        errorMsg,
        { parse_mode: "Markdown" },
      );
      return;
    }
  });

bot
  .filter((ctx) => OWNERS.includes(ctx.from!.id))
  .command("list", async (ctx) => {
    const reply = await ctx.reply("Processing...");
    const buttons = new InlineKeyboard();
    const allFeeds = await getAllFeeds();
    let c = 0, x = 0;
    for (const channelID in allFeeds) {
      for (const chatID of allFeeds[channelID]) {
        if (parseInt(chatID) == ctx.chat!.id) {
          const channelInfo = await fetch(
            "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelID,
          );
          const data = await parseFeed(await channelInfo.text());
          buttons.text(
            data.title.value ?? "channel",
            "rem" + channelID,
          );
          x++;
          c++;
          if (c == 2) {
            buttons.row();
            c = 0;
          }
        }
      }
    }
    if (x == 0) {
      return await ctx.api.editMessageText(
        ctx.chat!.id,
        reply.message_id,
        "No feeds added in this chat! Go ahead and use /add!!",
      );
    }
    await ctx.api.editMessageText(
      ctx.chat!.id,
      reply.message_id,
      "Here are the feeds in this chat. Click on the button to remove that channel notification from this chat.",
      { reply_markup: buttons },
    );
  });

bot
  .filter((ctx) => OWNERS.includes(ctx.from!.id))
  .callbackQuery(/rem(.*)/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `Removed the feed from <a href="https://youtube.com/channel/${ctx.match
        ?.[1]}">this channel</a> in the current chat.`,
      { parse_mode: "HTML" },
    );
    await removeFeed(ctx.chat!.id, ctx.match?.[1] ?? "");
  });

async function postFeeds() {
  const allFeeds = await getAllFeeds();
  for (const channelID in allFeeds) {
    try {
      const resp = await fetch(
        "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelID,
      );
      const data = await parseFeed(await resp.text());
      const latest = data.entries[0];
      if (await getLatest(channelID) !== latest.id) {
        for (const chatID of allFeeds[channelID]) {
          await bot.api.sendMessage(
            chatID,
            `<b>New video from</b> <a href="https://youtube.com/channel/${channelID}">${
              data.title.value ?? "channel"
            }</a>\n\n<a href="${
              latest.links[0].href
            }">${latest.title?.value}</a>`,
            { parse_mode: "HTML" },
          );
        }
        await storeLatest(channelID, latest.id);
      }
    } catch (e) {
      console.log(e);
    }
  }
}

// Run Job in every 15 minutes
cron("1 */30 * * * *", () => {
  postFeeds();
});
