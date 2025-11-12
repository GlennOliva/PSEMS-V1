import React, { useEffect, useState } from 'react';
import { Thermometer, Droplets, Wind, Activity, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import MetricCard from '../components/MetricCard';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import SensorNotification from '../components/Notification';



const firebaseConfig = {
  databaseURL: "https://psemsapp-6ea85-default-rtdb.asia-southeast1.firebasedatabase.app",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const Dashboard: React.FC = () => {




    const [harvestData, setHarvestData] = useState([]);
    const [mortalityData, setMortalityData] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;
  const currentUserId = localStorage.getItem('user_id');


   useEffect(() => {
    if (!currentUserId) {
      console.warn('No user_id in localStorage');
      return;
    }

 
    fetch(`${apiUrl}/api/harvest_data/${currentUserId}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
  .then(data => {
  const formatted = data.map((item: { batch_name: any; barn_name: any; no_harvest: any; no_boxes: any; }) => ({
    batch: item.batch_name,
    barn:  item.barn_name,     // ✅ now available
    chickens: item.no_harvest,
    boxes:   item.no_boxes
  }));
  setHarvestData(formatted);
      })
      .catch(err => console.error('Error fetching harvest data:', err));
  }, [apiUrl, currentUserId]);



  useEffect(() => {
    if (!currentUserId) {
      console.warn('No user_id in localStorage');
      return;
    }

    // 🔹 Fetch from backend with user_id as a parameter
    fetch(`${apiUrl}/api/mortality_data/${currentUserId}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
  .then(data => {
const formatted = data.map((item: { barn_name: any; quantity: any; cause: any; }) => ({
  barn: item.barn_name,
  mortality: item.quantity,
  cause: item.cause
}));


  setMortalityData(formatted);
      })
      .catch(err => console.error('Error fetching mortality data:', err));
  }, [apiUrl, currentUserId]);


 const [forecastData, setForecastData] = useState([]);

useEffect(() => {
  fetch(`${apiUrl}/api/monthly_forecast/`)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => setForecastData(data))
    .catch(err => console.error('Error fetching forecast:', err));
}, [apiUrl]); // ✅ only apiUrl is needed




 const [envData, setEnvData] = useState({
    temperature: 0,
    humidity: 0,
    nh3: 0,
    co2: 0,
  });

  useEffect(() => {
    const envRef = ref(db, "environment");
    onValue(envRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setEnvData({
          temperature: data.temperature,
          humidity: data.humidity,
          nh3: data.nh3,
          co2: data.co2,
        });
      }
    });
  }, []);

  const [sensorData, setSensorData] = useState({
    temperature: { value: 0, status: 'Normal' },
    humidity: { value: 0, status: 'Normal' },
    ammonia: { value: 0, status: 'Normal' },
    carbon: { value: 0, status: 'Normal' },
  });


 // Helper to classify status
  const classifyStatus = (type: string, value: number) => {
    switch (type) {
      case 'temperature':
        if (value > 35) return 'Critical';
        if (value > 30) return 'Warning';
        return 'Normal';
      case 'humidity':
        if (value > 85) return 'Warning';
        return 'Normal';
      case 'nh3':
        if (value > 10) return 'Critical';
        if (value > 5) return 'Warning';
        return 'Normal';
      case 'co2':
        if (value > 1200) return 'Critical';
        if (value > 1000) return 'Warning';
        return 'Normal';
      default:
        return 'Normal';
    }
  };

  // Listen to Firebase real-time data
  useEffect(() => {
    const envRef = ref(db, 'environment');
    const unsubscribe = onValue(envRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setEnvData(data);
        setSensorData({
          temperature: { value: data.temperature, status: classifyStatus('temperature', data.temperature) },
          humidity: { value: data.humidity, status: classifyStatus('humidity', data.humidity) },
          ammonia: { value: data.nh3, status: classifyStatus('nh3', data.nh3) },
          carbon: { value: data.co2, status: classifyStatus('co2', data.co2) },
        });
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const getAlertCount = (sensorData: any) => {
  const sensors = [sensorData.temperature, sensorData.humidity, sensorData.ammonia, sensorData.carbon];
  return sensors.filter(sensor => sensor.status !== 'Normal').length;
};


const [showNotifications, setShowNotifications] = useState(false);
const toggleNotifications = () => setShowNotifications(prev => !prev);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
   {/* Notification Bell */}
      <div className="relative">
        <Bell className="h-6 w-6 text-gray-600 cursor-pointer"
          onClick={toggleNotifications} />

        {getAlertCount(sensorData) > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5">
            {getAlertCount(sensorData)}
          </span>
        )}

{showNotifications && (
  <div className="absolute mt-3 w-64 bg-white shadow-lg rounded-lg border border-gray-200 p-3 z-50 right-[0rem]">
    <SensorNotification
      temperature={sensorData.temperature}
      humidity={sensorData.humidity}
      ammonia={sensorData.ammonia}
      carbon={sensorData.carbon}
    />
  </div>
)}


      </div>

      </div>

      {/* Environmental Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Temperature"
          value={envData.temperature}
          unit="°C"
          icon={Thermometer}
          color="red"
          trend={{ value: 2.1, isPositive: true }}
        />
        <MetricCard
          title="Humidity"
          value={envData.humidity}
          unit="%"
          icon={Droplets}
          color="blue"
          trend={{ value: 1.5, isPositive: false }}
        />
        <MetricCard
          title="Ammonia"
          value={envData.nh3}
          unit="ppm"
          icon={Wind}
          color="yellow"
          trend={{ value: 0.8, isPositive: false }}
        />
        <MetricCard
          title="CO₂"
          value={envData.co2}
          unit="ppm"
          icon={Activity}
          color="green"
          trend={{ value: 3.2, isPositive: true }}
        />
      </div>


      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Harvest Data Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Harvest Data</h3>
     <ResponsiveContainer width="100%" height={300}>
  <BarChart data={harvestData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="batch" />  {/* or "barn" or "date" */}
    <YAxis />
    <Tooltip formatter={(value, name) => [
      value,
      name === "chickens" ? "Chickens" : "Boxes"
    ]}
    labelFormatter={(label, payload) => {
      if (payload && payload[0]) {
        return `Batch: ${payload[0].payload.batch}`;
      }
      return label;
    }}/>
    <Bar dataKey="chickens" fill="#3B82F6" name="Chickens" />
    <Bar dataKey="boxes" fill="#10B981" name="Boxes" />
  </BarChart>
</ResponsiveContainer>

        </div>

        {/* Mortality Data Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mortality Data by Batch</h3>
          <ResponsiveContainer width="100%" height={300}>
  <BarChart data={mortalityData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="barn" />        {/* ✅ property name from mortalityData */}
    <YAxis />
    <Tooltip />
    <Bar dataKey="mortality" fill="#EF4444" name="Mortality" />
  </BarChart>
</ResponsiveContainer>

        </div>
      </div>

    {/* Monthly Forecast Chart */}
<div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
  <h3 className="text-xl font-bold text-gray-900 mb-2">
    Monthly Forecast: Mortality & Harvest
  </h3>
  <p className="text-sm text-gray-500 mb-6">
    Actual and predicted figures for each month
  </p>

  <ResponsiveContainer width="100%" height={420}>
    <LineChart
      data={forecastData}
      margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

<XAxis
  dataKey="month"
  axisLine={false}
  tickLine={false}
  tickFormatter={(value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    const options = { month: 'short', day: 'numeric' } as const;
    return date.toLocaleDateString('en-US', options); // e.g. "Jun 25"
  }}
  tick={{ fontSize: 13, fill: '#4b5563', fontWeight: 500 }}
/>



      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 13, fill: '#4b5563', fontWeight: 500 }}
        label={{ value: 'Chickens', angle: -90, position: 'insideLeft', fill: '#4b5563' }}
      />

      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          padding: '0.5rem 0.75rem'
        }}
        labelStyle={{ fontWeight: 600, color: '#374151' }}
      />

      <Legend
        verticalAlign="top"
        align="center"
        iconType="circle"
        wrapperStyle={{ paddingBottom: 10 }}
      />

      {/* Thinner lines */}
      <Line
        type="monotone"
        dataKey="actualMortality"
        stroke="#dc2626"
        strokeWidth={1.5}
        dot={{ r: 3, fill: '#dc2626' }}
        activeDot={{ r: 5 }}
        name="Actual Mortality"
        isAnimationActive
      />

      <Line
        type="monotone"
        dataKey="predictedMortality"
        stroke="#f97316"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        dot={{ r: 3, fill: '#f97316' }}
        activeDot={{ r: 5 }}
        name="Predicted Mortality"
        isAnimationActive
      />

      <Line
        type="monotone"
        dataKey="actualHarvest"
        stroke="#16a34a"
        strokeWidth={1.5}
        dot={{ r: 3, fill: '#16a34a' }}
        activeDot={{ r: 5 }}
        name="Actual Harvest"
        isAnimationActive
      />

      <Line
        type="monotone"
        dataKey="predictedHarvest"
        stroke="#22c55e"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        dot={{ r: 3, fill: '#22c55e' }}
        activeDot={{ r: 5 }}
        name="Predicted Harvest"
        isAnimationActive
      />
    </LineChart>
  </ResponsiveContainer>
</div>


    </div>
  );
};

export default Dashboard;