import List from './List';

export default function Layout({ title, transcriptId, children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Left Pane */}
      <div style={{ width: '30%', borderRight: '1px solid #ccc' }}>
        <List selected={transcriptId} />
      </div>

      {/* Right Pane */}
      <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
        {/* Title Bar */}
        {title && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f0f0f0',
            borderBottom: '1px solid #ccc',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            {title}
          </div>
        )}

        {/* Main Content */}
        <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
