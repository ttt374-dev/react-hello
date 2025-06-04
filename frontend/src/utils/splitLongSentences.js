const MAX_WORDS = 50;

export function splitLongSentences(sentences) {
  const result = [];

  for (const s of sentences) {
    const words = s.words || [];
    if (words.length <= MAX_WORDS) {
      result.push(s);
      continue;
    }

    let startIdx = 0;

    while (startIdx < words.length) {
      let endIdx = Math.min(startIdx + MAX_WORDS, words.length);

      for (let i = endIdx - 1; i > startIdx; i--) {
        const w = words[i].word || words[i].text;
        if (w === "," || w.endsWith(",")) {
          endIdx = i + 1;
          break;
        }
      }

      const chunkWords = words.slice(startIdx, endIdx);
      result.push({
        sentence: chunkWords.map((w) => w.word || w.text).join(" "),
        start: chunkWords[0].start,
        end: chunkWords[chunkWords.length - 1].end,
        words: chunkWords,
      });

      startIdx = endIdx;
    }
  }

  return result;
}
