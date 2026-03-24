import { motion } from 'framer-motion';
import { RealTimeFeed } from './components/RealTimeFeed';
import { GeofencingAlerts } from './components/GeofencingAlerts';
import { AlertMap } from './components/AlertMap';
import { useAttendancesToday } from './hooks/useDashboard';

export default function LiveMonitorPage() {
  const { data: rawAttendances, isLoading } = useAttendancesToday();
  const attendances = Array.isArray(rawAttendances)
    ? rawAttendances
    : (Array.isArray((rawAttendances as any)?.data) ? (rawAttendances as any).data : []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Real-time Feed */}
        <div className="flex-1 w-full">
           <RealTimeFeed attendances={attendances} loading={isLoading} />
        </div>

        {/* Alerts Sidebar */}
        <div className="w-full xl:w-[450px] flex flex-col gap-6">
            <GeofencingAlerts attendances={attendances} />
            <AlertMap />
        </div>
      </div>
    </motion.div>
  );
}
