'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Helper Icon Components ---
const ThermometerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="h-10 w-10 text-red-500">
      <g stroke="currentColor" strokeWidth="3" fill="none">
        <rect x="26" y="10" width="12" height="30" rx="6" />
        <circle cx="32" cy="48" r="10" fill="currentColor"></circle>
        <line x1="32" y1="40" x2="32" y2="18" stroke="currentColor"></line>
      </g>
    </svg>
  );
  
const WaterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="h-10 w-10 text-blue-500">
    <path
      d="M32 8C32 8 16 28 16 40C16 51 23 56 32 56C41 56 48 51 48 40C48 28 32 8 32 8Z"
      fill="currentColor"
    >
      <animate
        attributeName="fill-opacity"
        values="0.7;1;0.7"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>

    <circle cx="28" cy="28" r="4" fill="white" opacity="0.6">
      <animate
        attributeName="r"
        values="3;5;3"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

const WindIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="h-10 w-10 text-gray-600">
    
    <circle cx="18" cy="28" r="4" fill="currentColor" opacity="0.8">
      <animate attributeName="cy" values="28;24;28" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="30" cy="40" r="3" fill="currentColor" opacity="0.6">
      <animate attributeName="cy" values="40;36;40" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="44" cy="26" r="5" fill="currentColor" opacity="0.7">
      <animate attributeName="cy" values="26;22;26" dur="3s" repeatCount="indefinite" />
    </circle>
    <text
      x="32"
      y="60"
      textAnchor="middle"
      fontSize="10"
      fill="currentColor"
      fontWeight="bold"
    >
      PM2.5
    </text>
  </svg>
);

const LoadingSpinner = ({ text = 'Loading...' }) => (
    <div className="flex items-center justify-center p-4">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{text}</span>
    </div>
);


function DeviceDetailsModal({ deviceUid, onClose }) {
    const [device, setDevice] = useState(null);
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const getDeviceData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/devices/${deviceUid}/data`);
                if (!response.ok) throw new Error('Failed to fetch initial data.');
                const data = await response.json();
                setDevice(data.device);
                setReadings(data.readings);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        getDeviceData();

        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('connect', () => {
            console.log('Socket connected for modal:', socketRef.current.id);
            socketRef.current.emit('join-room', deviceUid);
        });

        socketRef.current.on('new-telemetry-data', (newReading) => {
            setReadings(prevReadings => [newReading, ...prevReadings.slice(0, 9)]);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [deviceUid]);

    const chartData = [...readings].reverse();
    const formatXAxis = (tickItem) => new Date(tickItem).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform animate-slide-up">
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Device Telemetry</h2>
                        <p className="text-sm text-gray-500">{device ? device.name : 'Loading...'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="p-4 sm:p-6 overflow-y-auto">
                    {loading && <LoadingSpinner text="Fetching initial readings..." />}
                    {error && <div className="text-center text-red-500 p-8">Error: {error}</div>}
                    {!loading && !error && (
                        <div>
                            {readings.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-center space-x-3"><ThermometerIcon /><div><div className="text-sm text-red-700">Temperature</div><div className="text-lg text-black font-semibold">{Number(readings[0].temp).toFixed(2)} °C</div></div></div>
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center space-x-3"><WaterIcon /><div><div className="text-sm text-blue-700">Humidity</div><div className="text-lg text-black font-semibold">{Number(readings[0].hum).toFixed(2)} %</div></div></div>
                                    <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex items-center space-x-3"><WindIcon /><div><div className="text-sm text-green-700">PM2.5</div><div className="text-lg text-black font-semibold">{Number(readings[0].pm25).toFixed(2)} µg/m³</div></div></div>
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-gray-50 rounded-lg"><p className="text-gray-500">No telemetry data yet. Waiting for new readings...</p></div>
                            )}

                            {readings.length > 0 && (
                                <div className="w-full h-80 mt-8">
                                    <h3 className="font-semibold text-gray-700 mb-3">Readings History</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="serverTimestamp" tickFormatter={formatXAxis} />
                                            <YAxis yAxisId="left" stroke="#dc2626" />
                                            <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                                            <Tooltip
                                                formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value}
                                                labelFormatter={(label) => new Date(label).toLocaleString('en-GB')}
                                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                                                labelStyle={{ color: 'black' }}
                                            />
                                            <Legend />
                                            <Line yAxisId="left" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                            <Line yAxisId="right" type="monotone" dataKey="hum" name="Humidity (%)" stroke="#3b82f6" strokeWidth={2} />
                                            <Line yAxisId="right" type="monotone" dataKey="pm25" name="PM2.5" stroke="#16a34a" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


// --- Main Dashboard Page Component ---
export default function IotDashboardPage() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeviceUid, setSelectedDeviceUid] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/');
            return;
        }

        const getDevices = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/devices');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setDevices(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        getDevices();

        //Setup global socket listener for the dashboard
        const socket = io('http://localhost:5000');
        socket.on('connect', () => {
            console.log('Global socket connected for dashboard:', socket.id);
        });

        socket.on('latest-device-update', (updatedReading) => {
            setDevices(currentDevices => {
                return currentDevices.map(dev => {
                    // Find the device that got the update and replace its 'latestReading'
                    if (dev.uid === updatedReading.device.uid) {
                        return { ...dev, latestReading: updatedReading };
                    }
                    return dev;
                });
            });
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };

    }, [router]);

    const handleViewClick = (uid) => {
        setSelectedDeviceUid(uid);
        setIsModalOpen(true);
    };

    const renderContent = () => {
        if (loading) return <LoadingSpinner text="Loading devices..." />;
        if (error) return <div className="text-center text-red-500 p-8">Error: {error}</div>;
        if (devices.length === 0) return <div className="text-center text-gray-500 p-8">No devices found. Is the simulator running?</div>;

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="px-4 py-3 text-sm font-semibold text-gray-600 uppercase">Device UID</th>
                            <th className="px-4 py-3 text-sm font-semibold text-gray-600 uppercase">Name</th>
                            {/* NEW COLUMNS */}
                            <th className="px-4 py-3 text-sm font-semibold text-gray-600 uppercase ">Latest Values</th>
                            <th className="px-4 py-3 text-sm font-semibold text-gray-600 uppercase text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {devices.map((device) => (
                            <tr 
                                key={device.uid} 
                                className="hover:bg-gray-50 cursor-pointer" 
                                onClick={() => handleViewClick(device.uid)}
                            >
                                <td className="px-4 py-3 text-sm text-gray-800 font-mono">{device.uid}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{device.name}</td>
                                {/*NEW CELLS to display the latest reading */}
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {device.latestReading ? (
                                        <div className="flex items-center space-x-4">
                                            <span title="Temperature"><ThermometerIcon /> {Number(device.latestReading.temp).toFixed(1)}°C</span>
                                            <span title="Humidity"><WaterIcon /> {Number(device.latestReading.hum).toFixed(1)}%</span>
                                            <span title="PM2.5"><WindIcon /> {Number(device.latestReading.pm25).toFixed(1)}µg/m³</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">No data yet</span>
                                    )}
                                </td>
                                
                                <td className="px-4 py-3 text-sm text-center">
                                    <button onClick={(e) => { e.stopPropagation(); handleViewClick(device.uid); }} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <>
            <main className="bg-gray-100 min-h-screen w-full p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">IoT Device Dashboard</h1>
                    {renderContent()}
                </div>
            </main>
            {isModalOpen && <DeviceDetailsModal deviceUid={selectedDeviceUid} onClose={() => setIsModalOpen(false)} />}
        </>
    );
}

