import { messagingApi, validateSignature } from "@line/bot-sdk";

export { validateSignature };

const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "",
});

export async function replyText(replyToken: string, text: string): Promise<void> {
  await lineClient.replyMessage({
    replyToken,
    messages: [{ type: "text", text }],
  });
}

export async function pushText(lineUserId: string, text: string): Promise<void> {
  await lineClient.pushMessage({
    to: lineUserId,
    messages: [{ type: "text", text }],
  });
}
