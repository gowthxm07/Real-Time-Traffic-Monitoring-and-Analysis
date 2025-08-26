import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { firestore as db } from './firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import './UserDashboard.css';

// OpenRouteService API key
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjczNzEyNTgyNDNlNjRhYmI5Y2FmNmNkMmQ1YzU3ODA4IiwiaCI6Im11cm11cjY0In0=';

// Default map center (e.g., New York; adjust as needed)
const center = [40.7128, -74.0060];

function Routing({ originCoords, destCoords, showAlternatives }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !originCoords || !destCoords) return;

    // Custom ORS router
    const orsRouter = {
      route: function (waypoints, callback, context) {
        const [start, end] = waypoints;
        fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`
        )
          .then(response => response.json())
          .then(data => {
            if (data.features && data.features.length > 0) {
              const coords = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
              const route = {
                name: 'Primary Route',
                coordinates: coords,
                summary: { totalDistance: data.features[0].properties.segments[0].distance },
                instructions: data.features[0].properties.segments[0].steps.map(step => ({
                  text: step.instruction,
                  distance: step.distance,
                })),
                waypoints: waypoints,
              };
              // Fetch alternative routes if needed
              if (showAlternatives) {
                fetch(
                  `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}&alternative_routes=2`
                )
                  .then(altResponse => altResponse.json())
                  .then(altData => {
                    const altRoutes = altData.features.slice(1).map((feature, index) => ({
                      name: `Alternative Route ${index + 1}`,
                      coordinates: feature.geometry.coordinates.map(coord => [coord[1], coord[0]]),
                      summary: { totalDistance: feature.properties.segments[0].distance },
                      instructions: feature.properties.segments[0].steps.map(step => ({
                        text: step.instruction,
                        distance: step.distance,
                      })),
                      waypoints: waypoints,
                    }));
                    callback.call(context, null, [route, ...altRoutes]);
                  })
                  .catch(err => callback.call(context, err, [route]));
              } else {
                callback.call(context, null, [route]);
              }
            } else {
              callback.call(context, new Error('No route found'), []);
            }
          })
          .catch(err => callback.call(context, err, []));
      }
    };

    const routingControl = L.Routing.control({
      router: orsRouter,
      waypoints: [
        L.latLng(originCoords.lat, originCoords.lng),
        L.latLng(destCoords.lat, destCoords.lng),
      ],
      routeWhileDragging: true,
      showAlternatives: showAlternatives,
      altLineOptions: {
        styles: [
          { color: 'black', opacity: 0.15, weight: 9 },
          { color: 'white', opacity: 0.8, weight: 6 },
          { color: 'red', opacity: 0.5, weight: 5 },
        ],
      },
      lineOptions: {
        styles: [{ color: 'blue', weight: 4 }],
      },
      formatter: new L.Routing.Formatter({ language: 'en' }),
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, originCoords, destCoords, showAlternatives]);

  return null;
}

function UserDashboard() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef();

  useEffect(() => {
    const q = query(collection(db, 'traffic_logs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newData = snapshot.docs.map(doc => doc.data());
      setTrafficData(newData);
    });
    return unsubscribe;
  }, []);

  // Check for consecutive high traffic (last 2 entries)
  useEffect(() => {
    if (trafficData.length >= 2) {
      const sortedData = [...trafficData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const lastTwo = sortedData.slice(0, 2);
      const isConsecutiveHigh = lastTwo.every(item => item.traffic_level === 'High');
      setShowAlternatives(isConsecutiveHigh);
    } else {
      setShowAlternatives(false);
    }
  }, [trafficData]);

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        return { lat, lng };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const originLoc = await geocodeAddress(origin);
    const destLoc = await geocodeAddress(destination);
    if (originLoc && destLoc) {
      setOriginCoords(originLoc);
      setDestCoords(destLoc);
    } else {
      alert('Could not find locations. Try more specific addresses (e.g., city, country).');
    }
    setIsLoading(false);
  };

  return (
    <div className="user-dashboard">
      <h2>🗺️ Route Planner</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Source Location (e.g., Times Square, New York, NY)"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="input-field"
          required
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Destination Location (e.g., Central Park, New York, NY)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="input-field"
          required
          disabled={isLoading}
        />
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Get Route'}
        </button>
      </form>
      <MapContainer center={center} zoom={10} style={{ height: '500px', width: '100%' }} ref={mapRef}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Routing originCoords={originCoords} destCoords={destCoords} showAlternatives={showAlternatives} />
      </MapContainer>
      {showAlternatives && <p className="alert">High traffic detected for 20+ seconds—showing alternative routes in red.</p>}
    </div>
  );
}

export default UserDashboard;