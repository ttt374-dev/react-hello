import { useEffect, useState } from "react";
import { splitLongSentences } from "../utils/splitLongSentences";

export function useTranscriptData(transcriptId) {
  const [sentences, setSentences] = useState([]);
  //const [title, setTitle] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!transcriptId) return;

    fetch(`http://localhost:8000/api/transcripts/${transcriptId}`)
      .then((res) => res.json())
      .then((data) => setSentences(splitLongSentences(data)))
      .catch(() => setSentences([]));

    fetch(`http://localhost:8000/api/details/${transcriptId}`)
      .then((res) => res.json())
      .then(setData)
      //.then((data) => setTitle(data.title || transcriptId))
      .catch(() => setTitle(transcriptId));
  }, [transcriptId]);

  //return { sentences, title };
  return {
    sentences: sentences,
    title: data?.title || null,
    createdAt: data?.created_at || null,
  }
}
