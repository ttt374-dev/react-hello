import re

MAX_WORDS = 50
MIN_WORDS = 5

def segment_words_into_sentences(words):
    sentences = []
    sentence_words = []
    sentence_start = None
    sentence_end = None

    for w in words:
        if sentence_start is None:
            sentence_start = w['start']

        sentence_words.append(w)
        sentence_end = w['end']

        # Break sentence on punctuation
        if re.search(r"[.!?]$", w['text']):
            sentences.append(create_sentence(sentence_words, sentence_start, sentence_end))
            sentence_words = []
            sentence_start = None
            sentence_end = None

    # Handle leftover
    if sentence_words:
        sentences.append(create_sentence(sentence_words, sentence_start, sentence_end))

    # Step 1: Split long ones
    split_sentences = []
    for s in sentences:
        if len(s["words"]) > MAX_WORDS:
            split_sentences.extend(split_long_sentence(s))
        else:
            split_sentences.append(s)

    # Step 2: Combine short ones
    final_sentences = combine_short_sentences(split_sentences)

    return final_sentences

def create_sentence(words, start, end):
    text = " ".join(w["text"] for w in words)
    text = re.sub(r"\s+([.!?])", r"\1", text)
    return {
        "sentence": text,
        "start": start,
        "end": end,
        "words": [
            {"word": w["text"], "start": w["start"], "end": w["end"]}
            for w in words
        ],
    }

def split_long_sentence(s):
    words = s["words"]
    chunks = []
    start_idx = 0
    while start_idx < len(words):
        end_idx = min(start_idx + MAX_WORDS, len(words))

        # Try to split at comma
        for i in range(end_idx - 1, start_idx, -1):
            w = words[i]["word"] if "word" in words[i] else words[i]["text"]
            if w == "," or w.endswith(","):
                end_idx = i + 1
                break

        chunk = words[start_idx:end_idx]
        chunk_text = " ".join(w["word"] if "word" in w else w["text"] for w in chunk)
        chunk_text = re.sub(r"\s+([.!?])", r"\1", chunk_text)

        chunks.append({
            "sentence": chunk_text,
            "start": chunk[0]["start"],
            "end": chunk[-1]["end"],
            "words": chunk,
        })

        start_idx = end_idx

    return chunks

def combine_short_sentences(sentences):
    combined = []
    buffer = None

    for i, s in enumerate(sentences):
        if len(s["words"]) >= MIN_WORDS:
            if buffer:
                # Merge buffer into previous
                if combined:
                    prev = combined.pop()
                    merged = merge_sentences(prev, buffer)
                    combined.append(merged)
                else:
                    combined.append(buffer)
                buffer = None
            combined.append(s)
        else:
            if buffer:
                # Combine two short ones
                buffer = merge_sentences(buffer, s)
            else:
                buffer = s

    if buffer:
        if combined:
            prev = combined.pop()
            combined.append(merge_sentences(prev, buffer))
        else:
            combined.append(buffer)

    return combined

def merge_sentences(s1, s2):
    return {
        "sentence": s1["sentence"] + " " + s2["sentence"],
        "start": s1["start"],
        "end": s2["end"],
        "words": s1["words"] + s2["words"],
    }
