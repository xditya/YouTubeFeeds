# YouTube Feeds Bot.
Send notification to your telegram group/channel/private whenever a new video is uploaded on a youtube channel!

## Variables
- `BOT_TOKEN` - Your telegram bot token.
- `REDIS_URL` - Redis Database URL.
- `REDIS_PASSWORD` - Redis Database Password.
- `CHANNEL_ID` - YouTube channel id, eg: UCykFIBKkj5ce3SggtaYSwtQ
- `CHATS` - Chat id(s) split by space, to send notifications to.
- `TIME_DELAY` - Interval between checks, in seconds. defaulted as 86400 (24hrs) 

## Deploying
This can be deployed to any platform.
- Click to deploy to [Heroku](https://heroku.com/deploy?template=https://github.com/xditya/YouTubeFeeds)
- Qovery:    
  Redis url and password need not be added manually and qovery db can be used.
- Locals:   
  `git clone https://github.com/xditya/YouTubeFeeds && cd YouTubeFeeds`   
  `pip install -r req*`   
  `touch .env && nano .env` - fill up your vars.   
  `python bot.py`   

## Credits
- [Me](https://xditya.me)