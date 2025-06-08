import { createContext, useContext, useState } from "react";

const TranscriptionEventContext = createContext();

export function TranscriptionEventProvider({ children }) {
  const [refreshListVersion, setRefreshListVersion] = useState(0);

  const notifyTranscriptionComplete = () => {
    setRefreshListVersion((v) => v + 1);
  };

  return (
    <TranscriptionEventContext.Provider value={{ refreshListVersion, notifyTranscriptionComplete }}>
      {children}
    </TranscriptionEventContext.Provider>
  );
}

export function useTranscriptionEvent() {
  return useContext(TranscriptionEventContext);
}
