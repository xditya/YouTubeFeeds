# < (c) @xditya >
# Keep credits, if using.

import logging
from telethon import TelegramClient, Button
from decouple import config
from feedparser import parse
from helpers import get_redis
import asyncio

logging.basicConfig(
    format="[%(levelname) 5s/%(asctime)s] %(name)s: %(message)s", level=logging.INFO
)

bottoken = None

# start the bot
logging.info("Starting...")
apiid = 6
apihash = "eb06d4abfb49dc3eeb1aeb98ae0f581e"

try:
    bottoken = config("BOT_TOKEN")
    redis_url = config("REDIS_URL", default=None)
    redis_pass = config("REDIS_PASSWORD", default=None)
    channelid = config("CHANNEL_ID", default=None)
    chats = [int(x) for x in config("CHATS").split()]
    check_time = config("TIME_DELAY", cast=int, default=7200)
except:
    logging.warning("Environment vars are missing! Kindly recheck.")
    logging.info("Bot is quiting...")
    exit()

redis_db = get_redis(redis_url, redis_pass)

try:
    bot = (TelegramClient(None, apiid, apihash).start(bot_token=bottoken)).start()
except Exception as e:
    logging.warning(f"ERROR!\n{str(e)}")
    logging.info("Bot is quiting...")
    exit()


async def get_updates():
    async with bot:
        await sendMessage("Started.")
        while True:
            feed_ = parse(
                "https://www.youtube.com/feeds/videos.xml?channel_id={}".format(
                    channelid
                )
            )
            feed = feed_.entries[0]
            pic = "https://img.youtube.com/vi/{}/hqdefault.jpg".format(feed.yt_videoid)
            prev_ = redis_db.get("LAST_POST") or ""
            if feed.link != prev_:
                msg = "**New Video Uploaded to** [YouTube](https://www.youtube.com/channel/{})!\n\n".format(
                    channelid
                )
                msg += f"**{feed.title}**\n\n"
                link = feed.link
                redis_db.set("LAST_POST", link)
                try:
                    await sendMessage(
                        msg, pic, buttons=Button.url("Watch Now!", url=link)
                    )
                    await asyncio.sleep(check_time)
                except Exception as e:
                    logging.warning(e)


async def sendMessage(msg, pic=None, buttons=None):
    for i in chats:
        try:
            await bot.send_message(i, msg, file=pic, buttons=buttons)
        except ValueError:
            await bot.send_message(i, msg, buttons=buttons)
        except Exception as e:
            logging.warning(e)


logging.info("\n\nStarted. Join @BotzHub if you liked the bot!\n(c) @xditya")
bot.loop.run_until_complete(get_updates())
