# < (c) @xditya >
# Keep credits, if using.

import logging
from telethon import TelegramClient, Button
#from decouple import config
from feedparser import parse
import asyncio
import requests
import json

logging.basicConfig(
    format="[%(levelname) 5s/%(asctime)s] %(name)s: %(message)s", level=logging.INFO
)

bottoken = None

with open('config.json') as json_file:
    config = json.load(json_file)
    #bottoken = config["bot_token"]
    channelid = config["channel_id"][0]["id"] #### treat all of them!
    chats = config["chats"]
    check_time = config["check_time"]

with open('bot.secret', 'r') as file:
    bottoken = file.read().replace("\n","")

# start the bot
logging.info("Starting...")
apiid = 6
apihash = "eb06d4abfb49dc3eeb1aeb98ae0f581e"

try:
    bot = (TelegramClient(None, apiid, apihash).start(bot_token=bottoken)).start()
except Exception as e:
    logging.warning(f"ERROR!\n{str(e)}")
    logging.info("Bot is quiting...")
    exit()


async def get_updates():
    prev_ = ""
    async with bot:
        await sendMessage("Miau!\nIch bin gerade aufgewacht.\nFalls ich mal spontan einschlafe, wirst du es nicht merken.")
        while True:
            current_feed = parse("https://www.youtube.com/feeds/videos.xml?channel_id={}&max-results=50".format(channelid)) # download some page containing list of all videos an dother stuff

            if len(current_feed.entries) == 0:
                print("Found empty entries array:\n")#{}".format(current_feed.entries))
            else:
                print("Found non-empty entries array:\n")#{}".format(current_feed.entries))

            video_list = current_feed.entries # extract the list of videos.
            latest_video = video_list[0] # latest video
            print(len(video_list))
            #print(latest_video)
            pic = "https://img.youtube.com/vi/{}/hqdefault.jpg".format(latest_video.yt_videoid)
            #prev_ = redis_db.get("LAST_POST") or ""
            if latest_video.link != prev_:
                msg = "**Miau!\nIch hab Hunger, denn meine Futterbeauftragte hat schon wieder nichts besseres zu tun als einen Livestream zu starten anstatt Futter zu besorgen:**\nIhr Kanal: https://www.youtube.com/channel/{}\n\n".format(channelid)
                msg += f"**{latest_video.title}**\n{latest_video.link}\n"
                link = latest_video.link
                prev_ = link #redis_db.set("LAST_POST", link)
                try:
                    await sendMessage(msg, pic, buttons=Button.url("Livestream jetzt anschauen", url=link))
                except Exception as e:
                    logging.warning(e)
            await asyncio.sleep(check_time)



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
