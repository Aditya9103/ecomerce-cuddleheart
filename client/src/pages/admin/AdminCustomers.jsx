import { useGetUsersQuery, useToggleBlockUserMutation } from '../../store/slices/userApiSlice';
import { toast } from 'react-hot-toast';
import { Lock, Unlock } from 'lucide-react';

const AdminCustomers = () => {
  const { data: users, isLoading, refetch } = useGetUsersQuery();
  const [toggleBlock, { isLoading: isUpdating }] = useToggleBlockUserMutation();

  const handleToggleBlock = async (id) => {
    if (window.confirm('Are you sure you want to change this user\'s block status?')) {
      try {
        await toggleBlock(id).unwrap();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to update user');
      }
    }
  };

  if (isLoading) return <div>Loading customers...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-bold border-b border-gray-100">Name</th>
                <th className="p-4 font-bold border-b border-gray-100">Email</th>
                <th className="p-4 font-bold border-b border-gray-100">Phone</th>
                <th className="p-4 font-bold border-b border-gray-100">Joined</th>
                <th className="p-4 font-bold border-b border-gray-100">Status</th>
                <th className="p-4 font-bold border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users?.map((user) => (
                <tr key={user._id} className={`transition-colors ${user.isBlocked ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-gray-50/50'}`}>
                  <td className="p-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="p-4 text-sm text-gray-600">{user.email}</td>
                  <td className="p-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                  <td className="p-4 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleToggleBlock(user._id)}
                      disabled={isUpdating}
                      className={`flex items-center gap-2 ml-auto px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                        user.isBlocked ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-red-500 bg-red-50 hover:bg-red-100'
                      }`}
                    >
                      {user.isBlocked ? <><Unlock size={16}/> Unblock</> : <><Lock size={16}/> Block</>}
                    </button>
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
