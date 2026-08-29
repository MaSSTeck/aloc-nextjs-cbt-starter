import { QuestionsApi, Configuration } from "@massteck/aloc-sdk";

export function getAlocClient() {
  const apiKey = process.env.ALOC_API_KEY || "";
  const basePath = process.env.ALOC_BASE_URL || "https://dev.aloc.com.ng/api/v1";

  const config = new Configuration({
    apiKey: apiKey,
    basePath: basePath,
    headers: {
      "X-API-Key": apiKey,
    },
  });

  return new QuestionsApi(config);
}
