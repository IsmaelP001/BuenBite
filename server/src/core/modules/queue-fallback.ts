import { Logger } from "@nestjs/common";

type QueueAddOptions = Record<string, unknown> | undefined;

export type QueueLike<T = unknown> = {
  add: (name: string, data: T, opts?: QueueAddOptions) => Promise<null>;
};

export function isUpstashRestMode(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

export function createNoopQueue<T = unknown>(queueName: string): QueueLike<T> {
  const logger = new Logger(`NoopQueue:${queueName}`);

  return {
    async add(name: string): Promise<null> {
      logger.warn(
        `Skipping job "${name}" because BullMQ TCP is disabled in UPSTASH_REDIS_REST mode.`,
      );
      return null;
    },
  };
}
