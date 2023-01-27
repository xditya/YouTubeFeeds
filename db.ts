import config from "./env.ts";

import { connect } from "redis";

export const redis = await connect({
  hostname: config.REDIS_URI.split(":")[0],
  port: config.REDIS_URI.split(":")[1],
  password: config.REDIS_PASSWORD,
});

export async function getAllFeeds() {
  return JSON.parse(await redis.get("FEEDS") || "{}");
}

export async function addFeed(chatID: number, channelID: string) {
  const allFeeds = await getAllFeeds();

  if (!allFeeds[channelID]) {
    allFeeds[channelID] = [];
  }
  if (!allFeeds[channelID].includes(chatID)) {
    allFeeds[channelID].push(chatID);
  }
  await redis.set("FEEDS", JSON.stringify(allFeeds));
}
export async function removeFeed(chatID: number, channelID: string) {
  const allFeeds = await getAllFeeds();
  if (allFeeds[channelID]) {
    const newList = [];
    for (const id of allFeeds[channelID]) {
      if (id != chatID) {
        newList.push(id);
      }
    }
    allFeeds[channelID] = newList;
  }
  await redis.set("FEEDS", JSON.stringify(allFeeds));
}
export async function getAllLatest() {
  return JSON.parse(await redis.get("LATEST") || "{}");
}

export async function storeLatest(channelID: string, latest: string) {
  const allLatest = await getAllLatest();
  allLatest[channelID] = latest;
  await redis.set("LATEST", JSON.stringify(allLatest));
}

export async function getLatest(channelID: string) {
  const allLatest = await getAllLatest();
  return allLatest[channelID];
}
