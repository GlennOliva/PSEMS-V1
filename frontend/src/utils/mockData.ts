import { SensorReading, Batch, DailyLog, Harvest, GrowthTracking, ForecastData, BatchReport, Mortality, Barn} from '../types';

export const generateMockSensorData = (type: string, days: number = 7): SensorReading[] => {
  const data: SensorReading[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    for (let hour = 0; hour < 24; hour += 2) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      let value: number;
      let status: 'Normal' | 'Warning' | 'Critical' = 'Normal';
      
      switch (type) {
        case 'temperature':
          value = 22 + Math.random() * 8;
          status = value > 28 ? 'Warning' : value > 32 ? 'Critical' : 'Normal';
          break;
        case 'humidity':
          value = 50 + Math.random() * 30;
          status = value > 75 ? 'Warning' : value > 85 ? 'Critical' : 'Normal';
          break;
        case 'ammonia':
          value = Math.random() * 25;
          status = value > 15 ? 'Warning' : value > 20 ? 'Critical' : 'Normal';
          break;
        case 'co2':
          value = 800 + Math.random() * 1200;
          status = value > 1500 ? 'Warning' : value > 1800 ? 'Critical' : 'Normal';
          break;
        default:
          value = Math.random() * 100;
      }
      
      data.push({
        id: `${type}-${i}-${hour}`,
        date: date.toISOString().split('T')[0],
        time,
        value: Math.round(value * 100) / 100,
        status
      });
    }
  }
  
  return data;
};

export const mockBatches: Batch[] = [
  {
    id: 1,
    barn_id: 1, // numeric FK
    batch_name: 'wew',
    breed: 'Broiler',
    no_chicken: 2,
    date_started: '2024-01-15',
    date_completed: '2024-02-20',
    status: 'Completed'
  },
  {
    id: 2,
    barn_id: 2,
    batch_name: 'wew',
    breed: 'Layer',
    no_chicken: 800,
    date_started: '2024-02-01',
    date_completed: null,
    status: 'Active'
  },
  {
    id: 3,
    barn_id: 3,
    batch_name: 'wew',
    breed: 'Broiler',
    no_chicken: 1200,
    date_started: '2024-02-10',
    date_completed: null,
    status: 'Active'
  }
];



export const mockDailyLogs: DailyLog[] = [
  { id: '1', user_id: 1, batch_id: 'B001', date: '2024-01-16', mortality_id: 2, feed: 45.5 },
  { id: '2', user_id: 1, batch_id: 'B001', date: '2024-01-17', mortality_id: 1, feed: 47.2 },
  { id: '3',user_id: 1, batch_id: 'B002', date: '2024-02-02', mortality_id: 2, feed: 38.1 },
  { id: '4', user_id: 1, batch_id: 'B002', date: '2024-02-03', mortality_id: 1, feed: 39.5 }
];

export const mockHarvests: Harvest[] = [
  { id: '1', batch_id: 'B001', date: '2024-02-20', harvest: 950, number_of_boxes: 95 },
  { id: '2', batch_id: 'B003', date: '2024-03-15', harvest: 1150, number_of_boxes: 115 }
];

export const mockBarns: Barn[] = [
{
    id: '1',
    barn_name: 'Layer Barn',
    description: 'Houses laying hens',
    date: '2025-09-15'
  },
  {
    id: '2',
    barn_name: 'Broiler Barn',
    description: 'For broiler production',
    date: '2025-09-15'
  }
];


export const mockMortalities: Mortality[] = [
  {
    id: 1,
    user_id: 1,
    barn_id: 1,
    cause: 'Heat Stress',
    notes: 'High temperature caused stress-related mortality',
    date: '2024-02-05',
    quantity: 10,
  },
  {
    id: 1,
    user_id: 1,
    barn_id: 1,
    cause: 'Heat Stress',
    notes: 'High temperature caused stress-related mortality',
    date: '2024-02-05',
    quantity: 10,
  },
  {
       id: 1,
    user_id: 1,
    barn_id: 1,
    cause: 'Heat Stress',
    notes: 'High temperature caused stress-related mortality',
    date: '2024-02-05',
    quantity: 10,
  }
];



export const mockGrowthTracking: GrowthTracking[] = [
  {
    id: '1',
    batch_id: 'B001',
    date: '2024-01-22',
    age: 7,
    total_weight: 500.5,
    no_chickens: 998,
    average_weight_kg: 0.5
  },
  {
    id: '2',
    batch_id: 'B001',
    date: '2024-01-29',
    age: 14,
    total_weight: 1200.8,
    no_chickens: 997,
    average_weight_kg: 1.2
  }
];

export const mockForecastData: ForecastData = {
  actual_mortality: 45,
  predicted_mortality: 52,
  actual_harvest: 2100,
  predicted_harvest: 2250
};

export const mockMonthlyForecastData = [
  { month: 'Jan', actualMortality: 600, predictedMortality: 500, actualHarvest: 300, predictedHarvest: 1000 },
  { month: 'Feb', actualMortality: 500, predictedMortality: 400, actualHarvest: 300, predictedHarvest: 1000},
  { month: 'Mar', actualMortality: 550, predictedMortality: 530, actualHarvest: 300, predictedHarvest: 1000 },
  { month: 'Apr', actualMortality: 560, predictedMortality: 540, actualHarvest: 300, predictedHarvest: 1000 },
  { month: 'May', actualMortality: 480, predictedMortality: 460, actualHarvest: 300, predictedHarvest: 1000},
  { month: 'Jun', actualMortality: 450, predictedMortality: 430, actualHarvest: 300, predictedHarvest: 1000 },
  { month: 'Jul', actualMortality: 650, predictedMortality: 600, actualHarvest: 300, predictedHarvest: 1000 },
  { month: 'Aug', actualMortality: 370, predictedMortality: 320, actualHarvest: 300, predictedHarvest: 1000 },
  { month: 'Sep', actualMortality: 520, predictedMortality: 500, actualHarvest: 300, predictedHarvest: 1000 },
  { month: 'Oct', actualMortality: 530, predictedMortality: 480, actualHarvest: 0, predictedHarvest: 0 },
  { month: 'Nov', actualMortality: 560, predictedMortality: 510, actualHarvest: 0, predictedHarvest: 0 },
  { month: 'Dec', actualMortality: 600, predictedMortality: 580, actualHarvest: 0, predictedHarvest: 0 }
];

export const mockBatchReports: BatchReport[] = [
  {
    id: '1',
    date_started: '2024-01-15',
    date_completed: '2024-02-20',
    avg_temperature: 25.2,
    avg_humidity: 62.5,
    avg_ammonia: 12.1,
    avg_co2: 1350,
    mortality: 50,
    harvest: 950
  },
  {
    id: '2',
    date_started: '2024-02-01',
    avg_temperature: 24.8,
    avg_humidity: 65.2,
    avg_ammonia: 10.5,
    avg_co2: 1280,
    mortality: 15,
    harvest: 0
  }
];