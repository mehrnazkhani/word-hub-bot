import { Keyboard } from "grammy";
import { wordMessages } from "./messages";

export const cancelKeyboard = new Keyboard()
  .text(wordMessages.cancelButton)
  .resized();

export const removeCancelKeyboard = { remove_keyboard: true as const };
