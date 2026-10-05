export const baseFormMessages = {
  prompt: (word: string, base: string, description: string) =>
    `“${word}” is the ${description || "different form"} of “${base}”.\n\nChoose one:`,
  use: (base: string) => `Use “${base}”`,
  keep: (word: string) => `Keep “${word}”`,
} as const;
