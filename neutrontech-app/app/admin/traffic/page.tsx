import StatsGrid from '../components/StatsGrid';
import TrafficChart from '../components/TrafficChart';

export default function AdminTrafficPage() {
  return (
    <>
      <StatsGrid />
      <div className="grid grid-cols-1 gap-lg">
        <TrafficChart />
      </div>
    </>
  );
}
