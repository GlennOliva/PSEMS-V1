import React, { useEffect, useMemo, useRef, useState } from 'react';
import logo from '../images/image-removebg-preview.png';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Printer } from 'lucide-react';
import Table from '../components/Table';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  databaseURL: "https://psemsapp-6ea85-default-rtdb.asia-southeast1.firebasedatabase.app",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

interface Forecast {
  month: string;
  actualMortality: number;
  predictedMortality: number;
  actualHarvest: number;
  predictedHarvest: number;
}

interface SensorReading {
  date: string;
  time: string;
  value: number;
  type: string;
  status: string;
  id: string;
}

const Reports: React.FC = () => {
  const [harvestData, setHarvestData] = useState<any[]>([]);
  const [mortalityData, setMortalityData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<Forecast[]>([]);
  const [batchReports, setBatchReports] = useState<any[]>([]);
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
const [selectedMonth, setSelectedMonth] = useState<string>(() => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const allowedYears = [2025, 2026];

  const yearToUse = allowedYears.includes(currentYear) ? currentYear : 2026;

  return `${yearToUse}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});


  const printableRef = useRef<HTMLDivElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const currentUserId = localStorage.getItem('user_id');

  // ---------- Month formatter ----------
  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `${new Date(Number(year), Number(month) - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    })}`;
  };

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
    fetch(`${apiUrl}/api/monthly_forecast/`)
      .then(res => res.json())
      .then((data: Forecast[]) => setForecastData(data))
      .catch(err => console.error('Error fetching forecast:', err));
  }, [apiUrl]);

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
  }, [apiUrl]);

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

  // ---------- Firebase Sensor Listener ----------
  useEffect(() => {
    if (!currentUserId) return;

    const envRef = ref(db, 'environment');

    const unsubscribe = onValue(envRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];

        const readings = [
          { type: 'temperature', value: data.temperature },
          { type: 'humidity', value: data.humidity },
          { type: 'ammonia', value: data.nh3 },
          { type: 'co2', value: data.co2 }
        ];

        const classifyStatus = (type: string, value: number) => {
          switch (type) {
            case 'temperature':
              if (value > 35) return 'Critical';
              if (value > 30) return 'Warning';
              return 'Normal';
            case 'humidity':
              if (value > 85) return 'Warning';
              return 'Normal';
            case 'ammonia':
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

        const newSensorData: SensorReading[] = readings.map(r => ({
          date,
          time,
          value: Number(r.value),
          type: r.type,
          status: classifyStatus(r.type, Number(r.value)),
          id: ''
        }));

        setSensorData(prev => [...newSensorData, ...prev]);
      }
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // ---------- Filter sensor data by month ----------
  const filteredSensorData = useMemo(() => {
    return sensorData.filter(d => d.date.startsWith(selectedMonth));
  }, [sensorData, selectedMonth]);

  const chartDataByType = (type: string) =>
    filteredSensorData
      .filter(d => d.type === type)
      .map(d => ({ time: d.time, value: d.value }));

  // ---------- Latest forecast ----------
  const latest: Forecast | null = useMemo(() => {
    return forecastData.length > 0 ? forecastData[forecastData.length - 1] : null;
  }, [forecastData]);

  // ---------- Summary Report Table ----------
  // ---------- Summary Report Table ----------
const batchSummaryReport = useMemo(() => {
  const harvestMap: Record<string, any> = {};
  const mortalityMap: Record<string, number> = {};

  // helper normalize (fix mortality 0 issue)
  const normalizeKey = (val: string) =>
    (val || "").toString().trim().toLowerCase();

  // Harvest summary per batch
  harvestData.forEach((h) => {
    if (!harvestMap[h.batch]) {
      harvestMap[h.batch] = {
        batch: h.batch,
        barn: h.barn,
        harvestedChickens: 0,
        harvestedBoxes: 0,
      };
    }

    harvestMap[h.batch].harvestedChickens += Number(h.chickens || 0);
    harvestMap[h.batch].harvestedBoxes += Number(h.boxes || 0);
  });

  // Mortality summary per barn
  mortalityData.forEach((m) => {
    const barnKey = normalizeKey(m.barn);
    mortalityMap[barnKey] =
      (mortalityMap[barnKey] || 0) + Number(m.mortality || 0);
  });

  // Environmental monthly averages
  const avgByType = (type: string): number | null => {
    const values = filteredSensorData
      .filter((d) => d.type === type)
      .map((d) => Number(d.value));

    if (values.length === 0) return null;

    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const avgTemperature = avgByType("temperature");
  const avgHumidity = avgByType("humidity");
  const avgAmmonia = avgByType("ammonia");
  const avgCO2 = avgByType("co2");

  // Merge
  return Object.values(harvestMap).map((h: any) => {
    const mortalityCount = mortalityMap[normalizeKey(h.barn)] || 0;

    const totalBirds = h.harvestedChickens + mortalityCount;
    const mortalityRate = totalBirds > 0 ? (mortalityCount / totalBirds) * 100 : 0;

    return {
      batch: h.batch,
      barn: h.barn,
      harvestedChickens: h.harvestedChickens,
      harvestedBoxes: h.harvestedBoxes,
      mortalityCount,
      mortalityRate: mortalityRate.toFixed(2),

      // show "—" if no sensor data for selected month
      avgTemperature: avgTemperature !== null ? avgTemperature.toFixed(2) : "—",
      avgHumidity: avgHumidity !== null ? avgHumidity.toFixed(2) : "—",
      avgAmmonia: avgAmmonia !== null ? avgAmmonia.toFixed(2) : "—",
      avgCO2: avgCO2 !== null ? avgCO2.toFixed(2) : "—",

      predictedHarvest: latest?.predictedHarvest ?? "—",
      predictedMortality: latest?.predictedMortality ?? "—",
    };
  });
}, [harvestData, mortalityData, filteredSensorData, latest]);


  // ---------- Print Report ----------
  const handlePrintReport = () => {
    if (!printableRef.current) return;

    const printContents = printableRef.current.innerHTML;
    const monthDisplay = formatMonthDisplay(selectedMonth);

    const newWin = window.open('', '', 'width=900,height=700');
    if (newWin) {
      newWin.document.write(`
        <html>
          <head>
            <title>Farm Monthly Report</title>
            <style>
              body { font-family: 'Segoe UI', sans-serif; padding: 40px; background: #fff; color:#111827; line-height:1.6;}
              .header { text-align:center; border-bottom:2px solid #1e3a8a; padding-bottom:10px; margin-bottom:30px;}
              .header img { width:80px; height:80px; margin-bottom:10px;}
              .header h1 { font-size:22px; margin:5px 0; color:#1e3a8a;}
              .header h3 { font-size:16px; margin:0; color:#374151;}
              .date { text-align:right; font-size:14px; color:#374151; margin-bottom:20px;}
              .section { margin-bottom:30px;}
              table { width:100%; border-collapse:collapse; margin-top:15px; font-size:13px;}
              th, td { border:1px solid #d1d5db; padding:10px; text-align:center;}
              th { background-color:#1e40af; color:white; font-weight:600;}
              tr:nth-child(even){ background-color:#f9fafb;}
              footer { text-align:center; margin-top:40px; font-size:12px; color:#6b7280;}
              @media print { button{ display:none;} body{ padding:20mm; }}
            </style>
          </head>
          <body>
            <div class="header">
              <img src="${logo}" alt="PSEMS Logo" />
              <h1>POULTRY SENSE ENVIRONMENTAL MONITORING SYSTEM</h1>
              <h3>Farm Monthly Report: ${monthDisplay}</h3>
            </div>
            <div class="date">Date: ${new Date().toLocaleDateString()}</div>
            <div class="content">${printContents}</div>
            <footer><p>Generated automatically by PSEMS System</p></footer>
          </body>
        </html>
      `);
      newWin.document.close();
      newWin.focus();
      newWin.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={handlePrintReport}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Printer className="h-4 w-4 mr-2" /> Print Report
        </button>
      </div>

      {/* Month Filter */}
     {/* Month Filter */}
<div className="mb-4">
  <label className="mr-2 font-medium">Select Month:</label>

  <select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
    className="px-3 py-2 border rounded-lg"
  >
    {[2025, 2026].map((year) =>
      Array.from({ length: 12 }, (_, i) => {
        const month = String(i + 1).padStart(2, "0");
        return (
          <option key={`${year}-${month}`} value={`${year}-${month}`}>
            {formatMonthDisplay(`${year}-${month}`)}
          </option>
        );
      })
    )}
  </select>
</div>


      {/* Printable Section */}
      <div ref={printableRef}>
        {/* Generated Report Summary Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 section">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Generated Monthly Report Summary ({formatMonthDisplay(selectedMonth)})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="border px-3 py-2">Batch No.</th>
                  <th className="border px-3 py-2">Barn</th>
                  <th className="border px-3 py-2">Harvested Chickens</th>
                  <th className="border px-3 py-2">Harvested Boxes</th>
                  <th className="border px-3 py-2">Mortality Count</th>
                  <th className="border px-3 py-2">Mortality Rate (%)</th>
                  <th className="border px-3 py-2">Avg Temp (°C)</th>
                  <th className="border px-3 py-2">Avg Humidity (%)</th>
                  <th className="border px-3 py-2">Avg Ammonia (ppm)</th>
                  <th className="border px-3 py-2">Avg CO₂ (ppm)</th>
                  <th className="border px-3 py-2">Forecast Harvest</th>
                  <th className="border px-3 py-2">Forecast Mortality</th>
                </tr>
              </thead>

              <tbody>
                {batchSummaryReport.length > 0 ? (
                  batchSummaryReport.map((row, idx) => (
                    <tr key={idx} className="text-center even:bg-gray-50">
                      <td className="border px-3 py-2 font-semibold">{row.batch}</td>
                      <td className="border px-3 py-2">{row.barn}</td>
                      <td className="border px-3 py-2">{row.harvestedChickens}</td>
                      <td className="border px-3 py-2">{row.harvestedBoxes}</td>
                      <td className="border px-3 py-2 text-red-600 font-semibold">{row.mortalityCount}</td>
                      <td className="border px-3 py-2">{row.mortalityRate}%</td>
                      <td className="border px-3 py-2">{row.avgTemperature}</td>
                      <td className="border px-3 py-2">{row.avgHumidity}</td>
                      <td className="border px-3 py-2">{row.avgAmmonia}</td>
                      <td className="border px-3 py-2">{row.avgCO2}</td>
                      <td className="border px-3 py-2 font-semibold">{row.predictedHarvest}</td>
                      <td className="border px-3 py-2 font-semibold">{row.predictedMortality}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="border px-3 py-4 text-center text-gray-500">
                      No data available for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Harvest & Mortality Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 section">
          {/* Harvest */}
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

          {/* Mortality */}
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

        {/* Environment Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 section">
          {['temperature', 'humidity', 'ammonia', 'co2'].map(type => {
            let title = '', unit = '';
            switch (type) {
              case 'temperature': title = 'Temperature'; unit = '°C'; break;
              case 'humidity': title = 'Humidity'; unit = '%'; break;
              case 'ammonia': title = 'Ammonia'; unit = 'ppm'; break;
              case 'co2': title = 'CO₂'; unit = 'ppm'; break;
            }
            const chartData = chartDataByType(type);
            return (
              <div key={type} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hourly Average {title} ({formatMonthDisplay(selectedMonth)})
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis label={{ value: `${title} (${unit})`, angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, title]}
                      labelFormatter={label => `Time: ${label}`}
                    />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>

        {/* Forecast Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 section">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            Forecast Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Actual Mortality</p>
              <p className="text-2xl font-bold text-red-600">{latest ? latest.actualMortality : '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Predicted Mortality</p>
              <p className="text-2xl font-bold text-orange-600">{latest ? latest.predictedMortality : '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Actual Harvest</p>
              <p className="text-2xl font-bold text-green-600">{latest ? latest.actualHarvest : '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Predicted Harvest</p>
              <p className="text-2xl font-bold text-blue-600">{latest ? latest.predictedHarvest : '—'}</p>
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
