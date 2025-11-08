import React, { useEffect, useState } from 'react';
import { Thermometer, Droplets, Wind, Activity, } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import MetricCard from '../components/MetricCard';


const Dashboard: React.FC = () => {




    const [harvestData, setHarvestData] = useState([]);
    const [mortalityData, setMortalityData] = useState([]);

  // ✅ Read API base URL and user_id from localStorage
  const apiUrl = import.meta.env.VITE_API_URL;
  const currentUserId = localStorage.getItem('user_id');


   useEffect(() => {
    if (!currentUserId) {
      console.warn('No user_id in localStorage');
      return;
    }

    // 🔹 Fetch from backend with user_id as a parameter
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
  if (!currentUserId) return;

  fetch(`${apiUrl}/api/monthly_forecast/${currentUserId}`)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => setForecastData(data))   // ✅ correct setter
    .catch(err => console.error('Error fetching forecast:', err));
}, [apiUrl, currentUserId]);




  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {/* <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div> */}
      </div>

      {/* Environmental Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Temperature"
          value="25.4"
          unit="°C"
          icon={Thermometer}
          color="red"
          trend={{ value: 2.1, isPositive: true }}
        />
        <MetricCard
          title="Humidity"
          value="62.8"
          unit="%"
          icon={Droplets}
          color="blue"
          trend={{ value: 1.5, isPositive: false }}
        />
        <MetricCard
          title="Ammonia"
          value="12.3"
          unit="ppm"
          icon={Wind}
          color="yellow"
          trend={{ value: 0.8, isPositive: false }}
        />
        <MetricCard
          title="CO₂"
          value="1,350"
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