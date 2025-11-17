import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Filter } from 'lucide-react';
import { SensorReading } from '../types/index';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import axios from 'axios';

const firebaseConfig = {
  databaseURL: "https://psemsapp-6ea85-default-rtdb.asia-southeast1.firebasedatabase.app",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

interface SensorPageProps {
  title: string;
  unit: string;
  sensorType: string;
}


type Status =
  | 'Normal - 18°C to 30°C'
  | 'Harmful - May cause stress or illness'
  | 'Harmful - Risk of heat stress or death'
  | 'Normal - 50% to 70%'
  | 'Warning - May cause dehydration, respiratory stress, poor air quality'
  | 'Warning - Increased risk of disease'
  | 'Safe - Normal ventilation'
  | 'Ventilation should be improved; Acceptable short-term - Mild stress'
  | 'Hazardous - Respiratory distress; immediate ventilation improvement is required'
  | 'Ideal (Safe) - Best condition. No harm to poultry or workers. Promotes healthy growth & respiration'
  | 'Acceptable (Not Ideal) - Prolonged exposure may cause mild stress or irritation. Improve litter/ventilation'
  | 'Harmful - Unsafe. Risk of respiratory disease, eye irritation, poor growth. Immediate action needed';

const SensorPage: React.FC<SensorPageProps> = ({ title, unit, sensorType }) => {
  const [dateRange, setDateRange] = useState('7');
  const [statusFilter, setStatusFilter] = useState('all');
    const [sensorData, setSensorData] = useState<SensorReading[]>([]);
    const apiUrls = import.meta.env.VITE_API_URL;
  const currentUserId = localStorage.getItem('user_id');


 useEffect(() => {
  const envRef = ref(db, "environment");

  // Clear old logs when switching sensors
  setSensorData([]);

  const unsub = onValue(envRef, async (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];

    const classifyStatus = (type: string, value: number): Status => {
      switch (type) {
        case "temperature":
          if (value < 18) return "Harmful - May cause stress or illness";
          if (value > 30) return "Harmful - Risk of heat stress or death";
          return "Normal - 18°C to 30°C";

        case "humidity":
          if (value < 50) return "Warning - May cause dehydration, respiratory stress, poor air quality";
          if (value > 70) return "Warning - Increased risk of disease";
          return "Normal - 50% to 70%";

        case "co2":
          if (value >= 3000) return "Hazardous - Respiratory distress; immediate ventilation improvement is required";
          if (value >= 2500) return "Ventilation should be improved; Acceptable short-term - Mild stress";
          return "Safe - Normal ventilation";

        case "ammonia":
          if (value > 25) return "Harmful - Unsafe. Risk of respiratory disease, eye irritation, poor growth. Immediate action needed";
          if (value > 10) return "Acceptable (Not Ideal) - Prolonged exposure may cause mild stress or irritation. Improve litter/ventilation";
          return "Ideal (Safe) - Best condition. No harm to poultry or workers. Promotes healthy growth & respiration";

        default:
          return "Normal - 18°C to 30°C";
      }
    };


  


    // ✅ Only pick the selected sensor value
    let sensorValue: number | undefined = undefined;

    if (sensorType === "temperature") sensorValue = data.temperature;
    if (sensorType === "humidity") sensorValue = data.humidity;
    if (sensorType === "ammonia") sensorValue = data.nh3;
    if (sensorType === "co2") sensorValue = data.co2;

    // ❌ If wrong sensor → skip
    if (sensorValue === undefined) return;

    // Build new reading
    const newReading: SensorReading = {
      date,
      time,
      value: sensorValue,
      status: classifyStatus(sensorType, sensorValue),
      id: ""
    };

    // Push only to selected sensor
    setSensorData(prev => [newReading, ...prev]);

    // SAVE TO API
    const payload: any = {
      user_id: currentUserId,
      date,
      time,
      status: newReading.status
    };

    let apiUrl = "";

    if (sensorType === "temperature") {
      apiUrl = `${apiUrls}/api/sensor/temperature`;
      payload.temperature_celcius = sensorValue;
    }

    if (sensorType === "humidity") {
      apiUrl = `${apiUrls}/api/sensor/humidity`;
      payload.humidity_percentage = sensorValue;
    }

    if (sensorType === "ammonia") {
      apiUrl = `${apiUrls}/api/sensor/ammonia`;
      payload.ammonia_ppm = sensorValue;
    }

    if (sensorType === "co2") {
      apiUrl = `${apiUrls}/api/sensor/carbon`;
      payload.carbon_ppm = sensorValue;
    }

    await axios.post(apiUrl, payload);

  });

  return () => unsub();
}, [sensorType]);



  const getStatusOptions = () => {
  switch (sensorType) {
    case "temperature":
      return [
        "Normal - 18°C to 30°C",
        "Harmful - May cause stress or illness",
        "Harmful - Risk of heat stress or death",
      ];

    case "humidity":
      return [
        "Normal - 50% to 70%",
        "Warning - May cause dehydration, respiratory stress, poor air quality",
        "Warning - Increased risk of disease",
      ];

    case "co2":
      return [
        "Safe - Normal ventilation",
        "Ventilation should be improved; Acceptable short-term - Mild stress",
        "Hazardous - Respiratory distress; immediate ventilation improvement is required",
      ];

    case "ammonia":
      return [
        "Ideal (Safe) - Best condition. No harm to poultry or workers. Promotes healthy growth & respiration",
        "Acceptable (Not Ideal) - Prolonged exposure may cause mild stress or irritation. Improve litter/ventilation",
        "Harmful - Unsafe. Risk of respiratory disease, eye irritation, poor growth. Immediate action needed",
      ];

    default:
      return [];
  }
};



  
  // Prepare chart data
  const chartData = sensorData.reduce((acc: any[], reading) => {
    const timeKey = reading.time;
    const existing = acc.find(item => item.time === timeKey);
    if (existing) {
      existing.count++;
      existing.totalValue += reading.value;
      existing.value = existing.totalValue / existing.count;
    } else {
      acc.push({ time: timeKey, value: reading.value, totalValue: reading.value, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => a.time.localeCompare(b.time));

  // Filter logs based on status
  const filteredLogs =
  statusFilter === "all"
    ? sensorData
    : sensorData.filter(r => r.status === statusFilter);


  const columns = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'time', label: 'Time', sortable: true },
    { key: 'value', label: `${title} (${unit})`, sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const getStatusBadge = (status: string) => {
    const colors = {
      Normal: 'bg-green-100 text-green-800',
      Warning: 'bg-yellow-100 text-yellow-800',
      Critical: 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>{status}</span>;
  };

  const tableData = filteredLogs.map(r => ({ ...r, value: `${r.value.toFixed(2)} ${unit}`, status: getStatusBadge(r.status) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title} Monitoring</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1">Last 24 hours</option>
              <option value="3">Last 3 days</option>
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hourly Average {title}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              label={{ value: `${title} (${unit})`, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, title]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ r: 4, fill: '#3B82F6' }}
              activeDot={{ r: 6, fill: '#1D4ED8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Logs Table */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200">
  <div className="px-6 py-4 border-b border-gray-200">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">{title} Logs</h3>
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
>
  <option value="all">All Status</option>

  {getStatusOptions().map((status, idx) => (
    <option key={idx} value={status}>
      {status}
    </option>
  ))}
</select>

      </div>
    </div>
  </div>

  <div className="overflow-x-auto">
    <div className="max-h-80 overflow-y-auto"> {/* Scrollable body */}
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-10"> {/* Optional sticky header */}
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {tableData.slice(0, 50).map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.time}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.value}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
    </div>
  );
};

export default SensorPage;