// SensorNotification.tsx
interface SensorNotificationProps {
  temperature: { value: number; status: 'Normal' | 'Warning' | 'Critical'; updatedAt?: Date };
  humidity: { value: number; status: 'Normal' | 'Warning' | 'Critical'; updatedAt?: Date };
  ammonia: { value: number; status: 'Normal' | 'Warning' | 'Critical'; updatedAt?: Date };
  carbon: { value: number; status: 'Normal' | 'Warning' | 'Critical'; updatedAt?: Date };
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
      <div className="flex flex-col">
        <span className="font-medium">{s.name}</span>
        {s.status !== 'Normal' && <span className="text-xs text-gray-500">{timeAgo(s.updatedAt)}</span>}
      </div>
      <span className="ml-2">{s.value} ({s.status})</span>
    </div>
  ))}
</div>

  );
};

export default SensorNotification;
