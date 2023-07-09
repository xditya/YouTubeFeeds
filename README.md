# YouTubeFeeds - YouTube Notifications

Get notifications in direct your telegram channel or group or DM once a new
video is uploaded by your favourite YouTube creator(s)!

<p align=center>
<img src="https://img.shields.io/github/stars/xditya/YouTubeFeeds?style=for-the-badge">
<img src="https://img.shields.io/github/forks/xditya/YouTubeFeeds?style=for-the-badge">
</p>

# Deploying

1. Fork (and star) the repository.
2. Head on to [deno deploy](https://dash.deno.com), and connect with your
   GitHub.
3. Search for "YouTubeFeeds", choose the `deno` branch, and select automatic
   deployments, and the file "serverless.ts".
4. Add the variables `BOT_TOKEN`, `OWNERS`, `REDIS_URI`, `REDIS_PASSWORD` and
   hit "Link".
5. Once deployed, copy the deployment URL, and open
   `https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<copied_URL>/<BOT_TOKEN>`
   (without < and >) and hit enter.

> You would get a message saying webhook was set. Voila, the bot is up and
> running!

# Using the bot

- Open a telegram chat with the bot, and send `/start` to check if it's working.
- Use the command `/add` to add a youtube channel to your feed. You can add by
  using the old youtube channelId links
  (`/add https://www.youtube.com/channel/UCykFIBKkj5ce3SggtaYSwtQ`) as well as
  the new channel username feature (`/add @xditya`).
- Use `/list` to view and remove added channels from the chat to stop receiving
  notifications.

# What's New?

Other than the bot supporting the new YouTube username feature, one deployed bot
can now be used in multiple telegram chats to get notifications from multiple YouTube
channels (unlike what it was before).

# Support Me

- [Subscribe to my YouTube channel](https://youtube.com/@xditya), it's free!
- [Donate for my works](https://github.com/sponsors/xditya).

# Connect with me

- [Telegram Channel](https://t.me/BotzHub)
- [Telegram Chat](https://t.me/BotzHubChat)
