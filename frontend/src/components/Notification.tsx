// SensorNotification.tsx
interface SensorNotificationProps {
  temperature: { value: number; status: string };
  humidity: { value: number; status: string };
  ammonia: { value: number; status: string };
  carbon: { value: number; status: string };
}

const SensorNotification: React.FC<SensorNotificationProps> = ({ temperature, humidity, ammonia, carbon }) => {
  const sensors = [
    { name: 'Temperature', ...temperature },
    { name: 'Humidity', ...humidity },
    { name: 'Ammonia', ...ammonia },
    { name: 'CO₂', ...carbon },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'text-yellow-500'; // orange for Normal
      case 'Warning':
        return 'text-red-700'; // red for Warning
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="space-y-2">
      {sensors.map((s, idx) => (
        <div key={idx} className={`flex justify-between px-2 py-1 rounded ${getStatusColor(s.status)}`}>
          <span>{s.name}</span>
          <span>{s.value} ({s.status})</span>
        </div>
      ))}
    </div>
  );
};

export default SensorNotification;
