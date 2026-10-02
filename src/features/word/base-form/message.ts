export const baseFormMessages = {
  prompt: (word: string, base: string, description: string) =>
    `🧩 “${word}” looks like a ${description || "different form"} of “${base}”.\nWhich one do you want to look up?`,
  use: (base: string) => `Use “${base}”`,
  keep: (word: string) => `Keep “${word}”`,
} as const;
