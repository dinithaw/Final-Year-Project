// import React, { useState, useEffect } from 'react';
// import './App.css';

// function LiveStream() {
//   const [detectionResults, setDetectionResults] = useState({});
//   const [dateTime, setDateTime] = useState(new Date());
//   const [location, setLocation] = useState({ lat: null, lon: null });

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       console.log("Attempting to fetch detection results...");
//       fetch('http://localhost:5001/detection_results')
//         .then(response => {
//           console.log("Response received:", response);
//           if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then(data => {
//           console.log("Fetched detection results:", data);
//           setDetectionResults(data); 
//         })
//         .catch(error => console.error('Error fetching detection results:', error));

//       setDateTime(new Date());
//     }, 1000); 

//     // Get location
//     navigator.geolocation.getCurrentPosition((position) => {
//       setLocation({
//         lat: position.coords.latitude.toFixed(4),
//         lon: position.coords.longitude.toFixed(4)
//       });
//     });

//     return () => clearInterval(intervalId);
//   }, []);

//   return (
//     <div className="live-stream-container">
//       <header>
//         <h1>Real-Time Object Detection</h1>
//         <div className="info-bar">
//           <span>{dateTime.toLocaleString()}</span>
//           {location.lat && location.lon && (
//             <span> | Lat: {location.lat} Lon: {location.lon}</span>
//           )}
//         </div>
//       </header>
//       <div className="video-container">
//         <img src="http://localhost:5001/video_feed" alt="Live Stream" />
//       </div>
//       <div className="detection-results">
//         <h2>Detected Objects:</h2>
//         {Object.keys(detectionResults).length > 0 ? (
//           <ul>
//             {Object.entries(detectionResults).map(([label, count], index) => (
//               <li key={index}>{count} {label}</li>
//             ))}
//           </ul>
//         ) : (
//           <p>No objects detected</p>
//         )}
//       </div>
//       <footer>
//         Developed by Dinitha Wickramasinghe
//       </footer>
//     </div>
//   );
// }

// function App() {
//   return (
//     <div className="App">
//       <LiveStream />
//     </div>
//   );
// }

// export default App;



//v2



// import React, { useState, useEffect } from 'react';
// import './App.css';

// function LiveStream() {
//   const [detectionResults, setDetectionResults] = useState([]);
//   const [dateTime, setDateTime] = useState(new Date());
//   const [location, setLocation] = useState({ lat: null, lon: null });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       console.log("Attempting to fetch detection results...");
//       fetch('http://localhost:5001/detection_results')
//         .then(response => {
//           console.log("Response received:", response);
//           if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then(data => {
//           console.log("Fetched detection results:", data);
//           // Handle both the new and old response formats
//           if (data.status === 'success' && Array.isArray(data.data)) {
//             setDetectionResults(data.data);
//           } else {
//             // Convert old format to new format if needed
//             const formattedResults = Object.entries(data).map(([label, count]) => {
//               // Extract disease name and confidence if in the format "disease (avg score: 0.xx)"
//               const match = label.match(/(.*) \(avg score: ([\d.]+)\)/);
//               if (match) {
//                 return {
//                   name: match[1].trim(),
//                   count: count,
//                   accuracy: parseFloat(match[2]) * 100, // Convert to percentage
//                   color: getColorForDisease(match[1].trim())
//                 };
//               } else {
//                 return {
//                   name: label,
//                   count: count,
//                   accuracy: 0,
//                   color: getColorForDisease(label)
//                 };
//               }
//             });
//             setDetectionResults(formattedResults);
//           }
//           setLoading(false);
//         })
//         .catch(error => {
//           console.error('Error fetching detection results:', error);
//           setError(error.message);
//           setLoading(false);
//         });

//       setDateTime(new Date());
//     }, 1000); 

//     // Get location
//     navigator.geolocation.getCurrentPosition((position) => {
//       setLocation({
//         lat: position.coords.latitude.toFixed(4),
//         lon: position.coords.longitude.toFixed(4)
//       });
//     });

//     return () => clearInterval(intervalId);
//   }, []);

//   // Function to get color for disease (fallback for old backend format)
//   const getColorForDisease = (diseaseName) => {
//     const colorMap = {
//       'bacterial_leaf_blight': [255, 0, 0],
//       'brown_spot': [165, 42, 42],
//       'healthy': [0, 255, 0],
//       'leaf_blast': [128, 0, 128],
//       'leaf_scald': [255, 165, 0],
//       'narrow_brown_spot': [210, 105, 30],
//       'neck_blast': [0, 0, 255],
//       'rice_hispa': [255, 20, 147],
//       'sheath_blight': [139, 69, 19],
//       'tungro': [255, 255, 0]
//     };
    
//     return colorMap[diseaseName] || [0, 128, 0]; // Default to green
//   };

//   // Convert RGB array to CSS color string
//   const rgbToCSS = (rgbArray) => {
//     return `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
//   };

//   return (
//     <div className="live-stream-container">
//       <header>
//         <h1>Rice Leaf Disease Detection</h1>
//         <div className="info-bar">
//           <span>{dateTime.toLocaleString()}</span>
//           {location.lat && location.lon && (
//             <span> | Lat: {location.lat} Lon: {location.lon}</span>
//           )}
//         </div>
//       </header>
      
//       <div className="content-container">
//         <div className="video-container">
//           <img src="http://localhost:5001/video_feed" alt="Live Stream" />
//         </div>
        
//         <div className="detection-results">
//           <h2>Detected Diseases:</h2>
          
//           {loading ? (
//             <div className="loading-message">
//               <p>Loading detection results...</p>
//             </div>
//           ) : error ? (
//             <div className="error-message">
//               <p>Error: {error}</p>
//               <p className="error-hint">Make sure your backend server is running and accessible.</p>
//             </div>
//           ) : detectionResults.length === 0 ? (
//             <p className="no-detection-message">No diseases detected. Point camera at rice plants.</p>
//           ) : (
//             <div className="results-container">
//               {detectionResults.map((result, index) => (
//                 <div key={index} className="disease-item">
//                   <div className="disease-header">
//                     <h3 className="disease-name" style={{ color: rgbToCSS(result.color) }}>
//                       {result.name.replace(/_/g, ' ').toUpperCase()}
//                     </h3>
//                     <span className="disease-count">
//                       Count: {result.count}
//                     </span>
//                   </div>
                  
//                   <div className="accuracy-bar-container">
//                     <div 
//                       className="accuracy-bar"
//                       style={{ 
//                         width: `${result.accuracy}%`,
//                         backgroundColor: rgbToCSS(result.color)
//                       }}
//                     ></div>
//                     <span className="accuracy-text">
//                       {result.accuracy.toFixed(2)}% confidence
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
      
//       <footer>
//         Developed by Dinitha Wickramasinghe
//       </footer>
//     </div>
//   );
// }

// function App() {
//   return (
//     <div className="App">
//       <LiveStream />
//     </div>
//   );
// }

// export default App;



//v3


import React, { useState, useEffect } from 'react';
import './App.css';

function LiveStream() {
  const [detectionResults, setDetectionResults] = useState([]);
  const [dateTime, setDateTime] = useState(new Date());
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

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
        
        // Handle the response data
        if (data.status === 'success' && Array.isArray(data.data)) {
          console.log("Using new format data:", data.data);
          setDetectionResults(data.data);
        } else {
          console.log("Using old format data:", data);
          // Convert old format to new format
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
                accuracy: 50, // Default to 50%
                color: getColorForDisease(label)
              };
            }
          });
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

    // Fetch data immediately and then set up interval
    fetchData();
    const intervalId = setInterval(() => {
      setDateTime(new Date());
      fetchData();
    }, 1000);

    // Get location once
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

    return () => clearInterval(intervalId);
  }, []);

  // Function to get color for disease
  const getColorForDisease = (diseaseName) => {
    const colorMap = {
      'bacterial_leaf_blight': [255, 0, 0],
      'brown_spot': [165, 42, 42],
      'healthy': [0, 255, 0],
      'leaf_blast': [128, 0, 128],
      'leaf_scald': [255, 165, 0],
      'narrow_brown_spot': [210, 105, 30],
      'neck_blast': [0, 0, 255],
      'rice_hispa': [255, 20, 147],
      'sheath_blight': [139, 69, 19],
      'tungro': [255, 255, 0]
    };
    
    return colorMap[diseaseName.toLowerCase()] || [0, 128, 0]; // Default to green
  };

  // Convert RGB array to CSS color string
  const rgbToCSS = (rgbArray) => {
    return `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
  };

  return (
    <div className="live-stream-container">
      <header>
        <h1>Rice Leaf Disease Detection</h1>
        <div className="info-bar">
          <span>{dateTime.toLocaleString()}</span>
          {location.lat && location.lon && (
            <span> | Lat: {location.lat} Lon: {location.lon}</span>
          )}
          {lastFetchTime && (
            <span> | Last fetch: {lastFetchTime}</span>
          )}
        </div>
      </header>
      
      <div className="content-container">
        <div className="video-container">
          <img 
            src="http://localhost:5001/video_feed" 
            alt="Live Stream" 
            onError={(e) => {
              console.error("Video feed error:", e);
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600'%3E%3Crect fill='%23f0f0f0' width='800' height='600'/%3E%3Ctext x='400' y='300' font-family='Arial' font-size='30' text-anchor='middle' fill='%23999'%3EVideo feed unavailable%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>
        
        <div className="detection-results">
          <h2>Detected Diseases:</h2>
          
          <div className="debug-info">
            <p>Status: {loading ? "Loading" : error ? "Error" : "Ready"}</p>
            <p>Results count: {detectionResults.length}</p>
            {error && <p className="error-text">Error: {error}</p>}
          </div>
          
          {loading ? (
            <div className="loading-message">
              <p>Loading detection results...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>Error: {error}</p>
              <p className="error-hint">Make sure your backend server is running and accessible.</p>
            </div>
          ) : detectionResults.length === 0 ? (
            <p className="no-detection-message">No diseases detected. Point camera at rice plants.</p>
          ) : (
            <div className="results-container">
              {detectionResults.map((result, index) => (
                <div key={index} className="disease-item">
                  <div className="disease-header">
                    <h3 className="disease-name" style={{ color: rgbToCSS(result.color) }}>
                      {result.name.replace(/_/g, ' ').toUpperCase()}
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
                      {result.accuracy?.toFixed(2) || 0}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <footer>
        Developed by Dinitha Wickramasinghe
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