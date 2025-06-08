<div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}>
        {/* Title Bar */}
        <TranscriptHeaderTitle
          title={editTitle}
          setTitle={setEditTitle}
          status={status}
          onSave={handleTitleSave}
          onDelete={handleDelete}
        />

        {/* Timestamp */}
        <div style={{
          fontSize: "0.9rem",
          color: "#aaa",
          margin: "0.25rem 1rem",
          flexShrink: 0,
        }}>
          created at: {new Date(createdAt).toLocaleString()}
        </div>

        {/* Scrollable Transcript */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          background: "#f4f4f4",
        }}>
          {(!sentences || sentences.length === 0) ? (
            <p>Loading transcript....</p>
          ) : (
            <TranscriptViewer sentences={sentences} audioRef={audioRef} />
          )}
        </div>

        {/* Fixed Footer Audio Player */}
        <TranscriptAudioPlayer audioRef={audioRef} transcriptId={transcriptId} />
      </div>