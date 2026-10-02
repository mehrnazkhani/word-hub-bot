import type { StorageAdapter } from "grammy";

export const createKvStorage = <T>(
  kv: KVNamespace,
  ttlSeconds = 3600,
): StorageAdapter<T> => {
  return {
    async read(key) {
      const value = await kv.get<T>(key, "json");
      return value ?? undefined;
    },

    async write(key, value) {
      await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
    },

    async delete(key) {
      await kv.delete(key);
    },
  };
};
