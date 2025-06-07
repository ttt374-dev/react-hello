import List from './components/List';

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      <div style={{ width: '20%', borderRight: '1px solid #ccc' }}>
        <List />
      </div>
      <div style={{ width: '80%', padding: '1rem' }}>
        {children}
      </div>
    </div>
  );
}
