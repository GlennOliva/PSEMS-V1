import React, { useEffect, useState } from 'react';

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

type BarnNotice = {
  message: string;
  at: string; // ISO string
};

const BARN_NOTICE_KEY = 'barn_occupancy_notice';

const SensorNotification: React.FC<SensorNotificationProps> = ({
  temperature,
  humidity,
  ammonia,
  carbon,
}) => {
  const sensors = [
    { name: 'Temperature', ...temperature },
    { name: 'Humidity', ...humidity },
    { name: 'Ammonia', ...ammonia },
    { name: 'CO₂', ...carbon },
  ];

  const [barnNotice, setBarnNotice] = useState<BarnNotice | null>(null);

  const timeAgo = (date?: Date) => {
    if (!date) return '';
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} day ago`;
  };

  // Determine color based on keywords in descriptive status
  const getStatusColor = (status: Status) => {
    if (status.includes('Harmful') || status.includes('Hazardous') || status.includes('Risk'))
      return 'text-red-600';
    if (status.includes('Warning') || status.includes('Acceptable'))
      return 'text-yellow-600';
    return 'text-green-600';
  };

  const isNormalStatus = (status: Status) =>
    status.includes('Normal') || status.includes('Safe') || status.includes('Ideal');

  // ✅ Load barn notice from localStorage (survives reload)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BARN_NOTICE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as BarnNotice & { at?: string };

      // Optional: only show notices not older than 10 minutes
      const at = parsed?.at ? new Date(parsed.at) : null;
      if (!at) return;

      const ageMs = new Date().getTime() - at.getTime();
      const tenMinutes = 10 * 60 * 1000;
      if (ageMs > tenMinutes) {
        localStorage.removeItem(BARN_NOTICE_KEY);
        return;
      }

      setBarnNotice({ message: parsed.message, at: parsed.at });
    } catch {
      // ignore parse errors
    }
  }, []);

  // ✅ Listen for event (instant update without reload)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message?: string; at?: string };
      if (!detail?.message || !detail?.at) return;

      const notice = { message: detail.message, at: detail.at };
      setBarnNotice(notice);

      // keep in localStorage so it stays after reload
      localStorage.setItem(BARN_NOTICE_KEY, JSON.stringify(notice));
    };

    window.addEventListener('barn-availability', handler as EventListener);
    return () => window.removeEventListener('barn-availability', handler as EventListener);
  }, []);

  return (
    <div className="space-y-2">
      {/* ✅ Barn availability system notice */}
      {barnNotice && (
        <div className="flex justify-between px-2 py-2 rounded text-green-700 bg-green-50 border border-green-200">
          <div className="flex flex-col">
            <span className="font-medium">System</span>
            <span className="text-xs text-gray-500">
              {timeAgo(new Date(barnNotice.at))}
            </span>
          </div>
          <span className="ml-2">{barnNotice.message}</span>
        </div>
      )}

      {sensors.map((s, idx) => (
        <div
          key={idx}
          className={`flex justify-between px-2 py-1 rounded ${getStatusColor(s.status)}`}
        >
          <div className="flex flex-col">
            <span className="font-medium">{s.name}</span>
            {!isNormalStatus(s.status) && (
              <span className="text-xs text-gray-500">{timeAgo(s.updatedAt)}</span>
            )}
          </div>
          <span className="ml-2">
            {s.value} ({s.status})
          </span>
        </div>
      ))}
    </div>
  );
};

export default SensorNotification;
