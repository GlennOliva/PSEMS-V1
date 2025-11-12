import React, { useEffect, useRef, useState } from 'react';
import logo from '../images/image-removebg-preview.png';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Printer } from 'lucide-react';
import Table from '../components/Table';
import axios from 'axios';

interface Forecast {
  month: string;
  actualMortality: number;
  predictedMortality: number;
  actualHarvest: number;
  predictedHarvest: number;
}

const Reports: React.FC = () => {
  const [harvestData, setHarvestData] = useState<any[]>([]);
  const [mortalityData, setMortalityData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<Forecast[]>([]);
  const [batchReports, setBatchReports] = useState<any[]>([]);
  const printableRef = useRef<HTMLDivElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const currentUserId = localStorage.getItem('user_id');

  // ---------- Harvest Data ----------
  useEffect(() => {
    if (!currentUserId) return;

    fetch(`${apiUrl}/api/harvest_data/${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((item: any) => ({
          batch: item.batch_name,
          barn: item.barn_name,
          chickens: item.no_harvest,
          boxes: item.no_boxes
        }));
        setHarvestData(formatted);
      })
      .catch(err => console.error('Error fetching harvest data:', err));
  }, [apiUrl, currentUserId]);

  // ---------- Mortality Data ----------
  useEffect(() => {
    if (!currentUserId) return;

    fetch(`${apiUrl}/api/mortality_data/${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((item: any) => ({
          barn: item.barn_name,
          mortality: item.quantity,
          cause: item.cause
        }));
        setMortalityData(formatted);
      })
      .catch(err => console.error('Error fetching mortality data:', err));
  }, [apiUrl, currentUserId]);

  // ---------- Forecast Data ----------
  useEffect(() => {
    if (!currentUserId) return;

    fetch(`${apiUrl}/api/monthly_forecast/${currentUserId}`)
      .then(res => res.json())
      .then((data: Forecast[]) => setForecastData(data))
      .catch(err => console.error('Error fetching forecast:', err));
  }, [apiUrl, currentUserId]);

  // ---------- Batch Reports ----------
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/reports/batch-report`);
        setBatchReports(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReports();
  }, []);

  const formatBatchReportData = (data: any[]) => {
    return data.map((d) => ({
      ...d,
      date_started: d.date_started ? new Date(d.date_started).toISOString().split('T')[0] : '',
      date_completed: d.date_completed ? new Date(d.date_completed).toISOString().split('T')[0] : '',
      avg_temperature: d.avg_temperature ?? 0,
      avg_humidity: d.avg_humidity ?? 0,
      avg_ammonia: d.avg_ammonia ?? 0,
      avg_co2: d.avg_co2 ?? 0,
    }));
  };

  const batchReportColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'date_started', label: 'Date Started', sortable: true },
    { key: 'date_completed', label: 'Date Completed', sortable: true },
    { key: 'avg_temperature', label: 'Avg Temperature (°C)', sortable: true },
    { key: 'avg_humidity', label: 'Avg Humidity (%)', sortable: true },
    { key: 'avg_ammonia', label: 'Avg Ammonia (ppm)', sortable: true },
    { key: 'avg_co2', label: 'Avg CO₂ (ppm)', sortable: true },
  ];

 const handlePrintReport = () => {
  if (printableRef.current) {
    const printContents = printableRef.current.innerHTML;
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const newWin = window.open('', '', 'width=900,height=700');
    if (newWin) {
      newWin.document.write(`
        <html>
          <head>
            <title>Farm Monthly Report</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 40px 60px;
                background-color: #fff;
                color: #111827;
                line-height: 1.6;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #1e3a8a;
                padding-bottom: 10px;
                margin-bottom: 30px;
              }
              .header img {
                width: 80px;
                height: 80px;
                margin-bottom: 10px;
              }
              .header h1 {
                font-size: 22px;
                margin: 5px 0;
                color: #1e3a8a;
                letter-spacing: 1px;
              }
              .header h3 {
                font-size: 16px;
                margin: 0;
                color: #374151;
              }
              .date {
                text-align: right;
                font-size: 14px;
                color: #374151;
                margin-bottom: 20px;
              }
              .section {
                margin-bottom: 30px;
              }
              .chart-container {
                width: 100%;
                height: 350px;
                margin-bottom: 30px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                font-size: 13px;
              }
              th, td {
                border: 1px solid #d1d5db;
                padding: 10px;
                text-align: center;
              }
              th {
                background-color: #1e40af;
                color: white;
                font-weight: 600;
              }
              tr:nth-child(even) {
                background-color: #f9fafb;
              }
              tr:hover {
                background-color: #f1f5f9;
              }
              footer {
                text-align: center;
                margin-top: 40px;
                font-size: 12px;
                color: #6b7280;
              }
              @media print {
                button { display: none; }
                body {
                  padding: 20mm;
                }
              }
            </style>
          </head>
          <body>
         <div class="header">
              <img src="${logo}" alt="PSEMS Logo" />
              <h1>POULTRY SMART ENVIRONMENT MONITORING SYSTEM</h1>
              <h3>Farm Monthly Report</h3>
            </div>

            <div class="date">Date: ${currentDate}</div>

            <div class="content">
              ${printContents}
            </div>

            <footer>
              <p>Generated automatically by PSEMS System</p>
            </footer>
          </body>
        </html>
      `);
      newWin.document.close();
      newWin.focus();
      newWin.print();
    }
  }
};


  const latest: Forecast | null =
    forecastData.length > 0 ? forecastData[forecastData.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={handlePrintReport}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </button>
      </div>

      {/* Printable Section */}
      <div ref={printableRef}>
        {/* Harvest & Mortality Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 section">
          {/* Harvest Data */}
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

          {/* Mortality Data */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mortality Data</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mortalityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="barn" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="mortality" fill="#EF4444" name="Mortality" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 section">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            Forecast Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Actual Mortality</p>
              <p className="text-2xl font-bold text-red-600">
                {latest ? latest.actualMortality : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Predicted Mortality</p>
              <p className="text-2xl font-bold text-orange-600">
                {latest ? latest.predictedMortality : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Actual Harvest</p>
              <p className="text-2xl font-bold text-green-600">
                {latest ? latest.actualHarvest : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Predicted Harvest</p>
              <p className="text-2xl font-bold text-blue-600">
                {latest ? latest.predictedHarvest : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Batch Reports Table */}
        <div className="section">
          <Table
            columns={batchReportColumns}
            data={formatBatchReportData(batchReports)}
            title="Batch Reports"
            searchable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
