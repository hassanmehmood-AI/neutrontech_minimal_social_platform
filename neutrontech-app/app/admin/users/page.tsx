import UserManagementTable from '../components/UserManagementTable';

export default function AdminUsersPage() {
  return (
    <div className="grid grid-cols-1 gap-lg">
      <UserManagementTable />
    </div>
  );
}
