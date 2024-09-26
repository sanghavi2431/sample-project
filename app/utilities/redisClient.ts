import * as Redis from 'redis';
import { RedisCommandArgument } from '@redis/client/dist/lib/commands';
import config from '../config';

export class RedisClient {
    private static instance: RedisClient | null = null;
    private client: Redis.RedisClientType;

    private constructor() {
        this.client = Redis.createClient({
            //password: config.REDIS.HOST,
            socket: {
                host: config.REDIS.HOST?.toString(),
                port: Number.parseInt(config.REDIS.PORT!.toString())
            }
        });

        this.client.on('error', (err: any) => {
            console.error(`Redis error: ${err}`);
        });
    }

    static async connect() {
        await this.getInstance().client.connect();
    }

    static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    async setEx(key: RedisCommandArgument, sec: number, value: RedisCommandArgument) {
        try {
            await this.client.connect();
            await this.client.setEx(key, sec, value);
            await this.client.disconnect();
            console.log("Redis Set Ex : ", key);
        } catch (e) {
            console.log("Redis error:", e);
        }
    }

    async getEx(key: RedisCommandArgument, sec: number): Promise<string | Buffer | null> {
        try {
            await this.client.connect();
            let value = await this.client.getEx(key, {EX: sec});
            await this.client.disconnect();
            return value;
        } catch (e) {
            console.log("Redis error:", e);
            return null;
        }
    }

    // Close the Redis connection
    quit(): void {
        this.client.quit();
    }
}