// SensorNotification.tsx
import React from 'react';

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

interface SensorNotificationProps {
  temperature: { value: number; status: Status; updatedAt?: Date };
  humidity: { value: number; status: Status; updatedAt?: Date };
  ammonia: { value: number; status: Status; updatedAt?: Date };
  carbon: { value: number; status: Status; updatedAt?: Date };
}

const SensorNotification: React.FC<SensorNotificationProps> = ({ temperature, humidity, ammonia, carbon }) => {
  const sensors = [
    { name: 'Temperature', ...temperature },
    { name: 'Humidity', ...humidity },
    { name: 'Ammonia', ...ammonia },
    { name: 'CO₂', ...carbon },
  ];

  const timeAgo = (date?: Date) => {
    if (!date) return '';
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000); // seconds
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} day ago`;
  };

  // Determine color based on keywords in descriptive status
  const getStatusColor = (status: Status) => {
    if (
      status.includes('Harmful') ||
      status.includes('Hazardous') ||
      status.includes('Risk')
    ) return 'text-red-600';
    if (status.includes('Warning') || status.includes('Acceptable')) return 'text-yellow-600';
    return 'text-green-600'; // Normal / Safe / Ideal
  };

  // Check if status is "normal" for showing updatedAt
  const isNormalStatus = (status: Status) =>
    status.includes('Normal') || status.includes('Safe') || status.includes('Ideal');

  return (
    <div className="space-y-2">
      {sensors.map((s, idx) => (
        <div key={idx} className={`flex justify-between px-2 py-1 rounded ${getStatusColor(s.status)}`}>
          <div className="flex flex-col">
            <span className="font-medium">{s.name}</span>
            {!isNormalStatus(s.status) && <span className="text-xs text-gray-500">{timeAgo(s.updatedAt)}</span>}
          </div>
          <span className="ml-2">{s.value} ({s.status})</span>
        </div>
      ))}
    </div>
  );
};

export default SensorNotification;
