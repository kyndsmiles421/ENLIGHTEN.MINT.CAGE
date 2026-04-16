import React, { useState } from 'react';

const HTTPSHub = () => {
  const [query, setQuery] = useState('');
  const [frameUrl, setFrameUrl] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Logic: If it starts with http, go to URL. Otherwise, search Google.
    const isUrl = query.startsWith('http://') || query.startsWith('https://');
    const target = isUrl ? query : `https://www.google.com/search?q=${encodeURIComponent(query)}&igu=1`;
    setFrameUrl(target);
  };

  return (
    <div style={{ 
      position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 100, width: '90%', maxWidth: '1000px' 
    }}>
      {/* THE SEARCH INPUT */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter HTTPS Address or Search Wisdom..."
          style={{ 
            flex: 1, padding: '15px', borderRadius: '30px', border: '1px solid #00ffcc',
            background: 'transparent', color: '#00ffcc', backdropFilter: 'none',
            outline: 'none', fontSize: '1rem'
          }}
        />
        <button type="submit" style={{ 
          padding: '0 25px', borderRadius: '30px', background: '#00ffcc', 
          color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold' 
        }}>
          GO
        </button>
      </form>

      {/* THE INTERNAL BROWSER WINDOW */}
      {frameUrl && (
        <div style={{ 
          width: '100%', height: '70vh', borderRadius: '15px', overflow: 'hidden', 
          border: '1px solid rgba(255,255,255,0.2)', background: 'white' 
        }}>
          <iframe 
            src={frameUrl} 
            style={{ width: '100%', height: '100%', border: 'none' }} 
            title="Internal Secure Browser"
          />
        </div>
      )}
    </div>
  );
};

export default HTTPSHub;
