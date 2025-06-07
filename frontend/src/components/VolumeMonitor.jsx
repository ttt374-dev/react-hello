
export default function VolumeMonitor ({ volume }){
  return (
    <div style={{ marginTop: "1rem", height: "10px", background: "#ccc" }}>
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, volume)}%`,
          background: "limegreen",
          transition: "width 0.1s",
        }}
      />
    </div>
  );
};