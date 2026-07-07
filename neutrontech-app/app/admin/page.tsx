import StatsGrid from './components/StatsGrid';
import TrafficChart from './components/TrafficChart';
import QuickSettings from './components/QuickSettings';
import UserManagementTable from './components/UserManagementTable';
import PostModeration from './components/PostModeration';
import ContactRequestsPanel from './components/ContactRequestsPanel';
import RecentSignups from './components/RecentSignups';

export default function AdminDashboardPage() {
  return (
    <>
      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
        <TrafficChart />
        <QuickSettings />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <UserManagementTable showMoreHref="/admin/users" />
        <PostModeration showMoreHref="/admin/posts" />
        <ContactRequestsPanel showMoreHref="/admin/contact-requests" />
        <RecentSignups showMoreHref="/admin/users" />
      </div>
    </>
  );
}
