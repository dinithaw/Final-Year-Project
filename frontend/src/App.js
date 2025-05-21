import React, { useState, useEffect } from 'react';
import './App.css';

function LiveStream() {
  const [detectionResults, setDetectionResults] = useState([]);
  const [dateTime, setDateTime] = useState(new Date());
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching detection results...");
        const startTime = new Date();
        
        const response = await fetch('http://localhost:5001/detection_results');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Received data:", data);
        
        if (data.status === 'success' && Array.isArray(data.data)) {
          console.log("Using new format data:", data.data);
          const filteredData = data.data.filter(result => result.accuracy > 90);
          setDetectionResults(filteredData);
        } else {
          console.log("Using old format data:", data);
          const formattedResults = Object.entries(data).map(([label, count]) => {
            const match = label.match(/(.*) \(avg score: ([\d.]+)\)/);
            if (match) {
              return {
                name: match[1].trim(),
                count: count,
                accuracy: parseFloat(match[2]) * 100,
                color: getColorForDisease(match[1].trim())
              };
            } else {
              return {
                name: label,
                count: count,
                accuracy: 50,
                color: getColorForDisease(label)
              };
            }
          }).filter(result => result.accuracy > 90);
          console.log("Formatted results:", formattedResults);
          setDetectionResults(formattedResults);
        }
        
        setLoading(false);
        const endTime = new Date();
        setLastFetchTime(`${endTime - startTime}ms`);
      } catch (error) {
        console.error('Error fetching detection results:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(() => {
      setDateTime(new Date());
      fetchData();
    }, 1000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toFixed(4),
            lon: position.coords.longitude.toFixed(4)
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }

    // Handle ESC key to exit fullscreen
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const getColorForDisease = (diseaseName) => {
    // Enhanced color scheme with more vibrant colors
    const colorMap = {
      'bacterial_leaf_blight': [239, 68, 68], // Red - more vibrant
      'brown_spot': [245, 158, 11], // Orange-amber
      'healthy': [34, 197, 94], // Green - more vibrant
      'leaf_blast': [236, 72, 153], // Pink - more vibrant
      'leaf_scald': [249, 115, 22], // Orange
      'narrow_brown_spot': [139, 92, 246], // Purple - more vibrant
      'neck_blast': [239, 68, 68], // Red - same as bacterial
      'rice_hispa': [14, 165, 233], // Light blue - more vibrant
      'sheath_blight': [167, 139, 250], // Light purple
      'tungro': [244, 63, 94] // Rose red
    };
    
    return colorMap[diseaseName.toLowerCase()] || [148, 163, 184]; // Slate gray as default
  };

  const rgbToCSS = (rgbArray) => {
    return `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Format disease name for display
  const formatDiseaseName = (name) => {
    return name
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="live-stream-container">
      <header>
        <h1>Rice Leaf Disease Detection</h1>
        <div className="info-bar">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {dateTime.toLocaleString()}
          </span>
          {location.lat && location.lon && (
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Lat: {location.lat} Lon: {location.lon}
            </span>
          )}
          {lastFetchTime && (
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Fetch: {lastFetchTime}
            </span>
          )}
        </div>
      </header>
      
      <div className="content-container">
        <div className="video-section">
          <div className={`video-container ${isFullscreen ? 'fullscreen' : ''}`}>
            <img 
              src="http://localhost:5001/video_feed" 
              alt="Live Stream" 
              onError={(e) => {
                console.error("Video feed error:", e);
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600'%3E%3Crect fill='%230f172a' width='800' height='600'/%3E%3Ctext x='400' y='300' font-family='Arial' font-size='30' text-anchor='middle' fill='%2394a3b8'%3EVideo feed unavailable%3C/text%3E%3Ctext x='400' y='350' font-family='Arial' font-size='20' text-anchor='middle' fill='%2360a5fa'%3ECheck server connection%3C/text%3E%3C/svg%3E";
              }}
            />
            <button className="exit-fullscreen" onClick={toggleFullscreen}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
              </svg>
            </button>
          </div>
          
          <div className="video-controls">
            <button className="fullscreen-btn" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                  </svg>
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  </svg>
                  Fullscreen
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="detection-results">
          <h2>Detected Diseases (Confidence > 90%)</h2>
          
          <div className="debug-info">
            <p>Status: {loading ? "Loading" : error ? "Error" : "Ready"}</p>
            <p>Results count: {detectionResults.length}</p>
            {error && <p className="error-text">Error: {error}</p>}
          </div>
          
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner"></div>
              <p>Loading detection results...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>Error: {error}</p>
              <p className="error-hint">Make sure your backend server is running and accessible.</p>
            </div>
          ) : detectionResults.length === 0 ? (
            <div className="no-detection-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                <circle cx="12" cy="13" r="3"></circle>
              </svg>
              <p>No high-confidence diseases detected</p>
              <p>Point camera at rice plants for analysis</p>
            </div>
          ) : (
            <div className="results-container">
              {detectionResults.map((result, index) => (
                <div 
                  key={index} 
                  className="disease-item"
                  style={{ borderLeftColor: rgbToCSS(result.color) }}
                >
                  <div className="disease-header">
                    <h3 className="disease-name" style={{ color: rgbToCSS(result.color) }}>
                      {formatDiseaseName(result.name)}
                    </h3>
                    <span className="disease-count">
                      Count: {result.count}
                    </span>
                  </div>
                  
                  <div className="accuracy-bar-container">
                    <div 
                      className="accuracy-bar"
                      style={{ 
                        width: `${result.accuracy}%`,
                        backgroundColor: rgbToCSS(result.color)
                      }}
                    ></div>
                    <span className="accuracy-text">
                      {result.accuracy?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <footer>
        <div>Developed by Dinitha Wickramasinghe</div>
        <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>Rice Leaf Disease Detection System - v1.2</div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <LiveStream />
    </div>
  );
}

export default App;