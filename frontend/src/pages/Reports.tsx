import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Printer, Download } from 'lucide-react';
import { mockBatchReports, mockForecastData } from '../utils/mockData';
import Table from '../components/Table';

const Reports: React.FC = () => {
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

  const batchReportColumns = [
    { key: 'batch_id', label: 'Batch ID', sortable: true },
    { key: 'date_started', label: 'Date Started', sortable: true },
    { key: 'date_completed', label: 'Date Completed', sortable: true },
    { key: 'avg_temperature', label: 'Avg Temperature (°C)', sortable: true },
    { key: 'avg_humidity', label: 'Avg Humidity (%)', sortable: true },
    { key: 'avg_ammonia', label: 'Avg Ammonia (ppm)', sortable: true },
    { key: 'avg_co2', label: 'Avg CO₂ (ppm)', sortable: true },
    { key: 'mortality', label: 'Mortality', sortable: true },
    { key: 'harvest', label: 'Harvest', sortable: true }
  ];

  const formatBatchReportData = (data: any[]) => {
    return data.map(report => ({
      ...report,
      date_completed: report.date_completed || 'Ongoing',
      avg_temperature: report.avg_temperature.toFixed(1),
      avg_humidity: report.avg_humidity.toFixed(1),
      avg_ammonia: report.avg_ammonia.toFixed(1),
      avg_co2: report.avg_co2.toLocaleString()
    }));
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    alert('Download functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleDownloadReport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </button>
        </div>
      </div>

      {/* Harvest & Mortality Charts */}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mortality Data</h3>
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

      {/* Forecast Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Forecast Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Actual Mortality</p>
            <p className="text-2xl font-bold text-red-600">{mockForecastData.actual_mortality}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Predicted Mortality</p>
            <p className="text-2xl font-bold text-orange-600">{mockForecastData.predicted_mortality}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Actual Harvest</p>
            <p className="text-2xl font-bold text-green-600">{mockForecastData.actual_harvest}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Predicted Harvest</p>
            <p className="text-2xl font-bold text-blue-600">{mockForecastData.predicted_harvest}</p>
          </div>
        </div>
      </div>

      {/* Batch Reports Table */}
      <Table
        columns={batchReportColumns}
        data={formatBatchReportData(mockBatchReports)}
        title="Batch Reports"
        searchable={true}
      />
    </div>
  );
};

export default Reports;