import type { WordDetails } from "../../ai/details";
import { escapeHtml, splitRelatedWords, WORD_LIMITS } from "../shared";

const POS_ABBREVIATION: Record<string, string> = {
  noun: "n.",
  verb: "v.",
  adjective: "adj.",
  adverb: "adv.",
  pronoun: "pron.",
  preposition: "prep.",
  conjunction: "conj.",
  interjection: "interj.",
};

const related = (value: string) =>
  splitRelatedWords(value).slice(0, WORD_LIMITS.maxRelatedWords).join(", ");

export const displayWordCard = (word: string, details: WordDetails): string => {
  const pos = POS_ABBREVIATION[details.partOfSpeech];
  const synonyms = related(details.synonyms);
  const antonyms = related(details.antonyms);

  const blocks = [
    `<code>${escapeHtml(word)}</code>${pos ? `  (<i>${pos}</i>)` : ""}`,
    details.translation && `${escapeHtml(details.translation)}`,
    details.description &&
      `<blockquote>${escapeHtml(details.description)}</blockquote>`,
    details.example && `<b>Example</b>\n${escapeHtml(details.example)}`,
    synonyms && `<b>Synonyms</b>\n${escapeHtml(synonyms)}`,
    antonyms && `<b>Antonyms</b>\n${escapeHtml(antonyms)}`,
  ];

  return blocks.filter(Boolean).join("\n\n");
};
