import React from 'react';
import { Thermometer, Droplets, Wind, Activity, } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import MetricCard from '../components/MetricCard';
import {  mockMonthlyForecastData } from '../utils/mockData';

const Dashboard: React.FC = () => {
  const harvestData = [
    { batch: 'B001', chickens: 950, boxes: 95 },
    { batch: 'B002', chickens: 780, boxes: 78 },
    { batch: 'B003', chickens: 1150, boxes: 115 }
  ];

  const mortalityData = [
    { batch: 'B001', mortality: 50 },
    { batch: 'B002', mortality: 20 },
    { batch: 'B003', mortality: 50 }
  ];


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
              <XAxis dataKey="batch" />
              <YAxis />
              <Tooltip />
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
              <XAxis dataKey="batch" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="mortality" fill="#EF4444" name="Mortality" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Forecast Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Forecast: Mortality and Harvest</h3>
        <p className="text-sm text-gray-600 mb-6">This chart displays actual and predicted mortality and harvest by month.</p>
        <div className="mb-4">
          <h4 className="text-center text-gray-700 font-medium">Forecast Chart</h4>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={mockMonthlyForecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              label={{ value: 'Chickens', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="actualMortality" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ r: 4, fill: '#ef4444' }}
              name="Actual Mortality"
            />
            <Line 
              type="monotone" 
              dataKey="predictedMortality" 
              stroke="#f97316" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#f97316' }}
              name="Predicted Mortality"
            />

                 <Line 
              type="monotone" 
              dataKey="predictedHarvest" 
              stroke="#f97316" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#e5b08aff' }}
              name="Predicted Harvest"
            />

                  <Line 
              type="monotone" 
              dataKey="actualHarvest" 
              stroke="#783708ff" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#e5b08aff' }}
              name="Actual Harvest"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>


    </div>
  );
};

export default Dashboard;