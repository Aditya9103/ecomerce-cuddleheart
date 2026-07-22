import React from 'react';
import { toast } from 'react-hot-toast';
import { useGetContactMessagesQuery, useUpdateContactMessageMutation } from '../../store/slices/contactApiSlice';

const AdminContacts = () => {
  const { data, isLoading, refetch } = useGetContactMessagesQuery();
  const [updateMessage] = useUpdateContactMessageMutation();

  const messages = data?.data || [];

  const handleMarkReplied = async (id) => {
    try {
      await updateMessage({ id, status: 'Replied' }).unwrap();
      refetch();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading messages...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Messages</h1>

      {messages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No messages found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-bold text-sm text-gray-600">Date</th>
                <th className="p-4 font-bold text-sm text-gray-600">Customer</th>
                <th className="p-4 font-bold text-sm text-gray-600">Subject</th>
                <th className="p-4 font-bold text-sm text-gray-600">Message</th>
                <th className="p-4 font-bold text-sm text-gray-600">Status</th>
                <th className="p-4 font-bold text-sm text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {messages.map(msg => (
                <tr key={msg._id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900 text-sm">{msg.name}</p>
                    <a href={`mailto:${msg.email}`} className="text-xs text-primary hover:underline">{msg.email}</a>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{msg.subject}</td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={msg.message}>
                    {msg.message}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      msg.status === 'Unread' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {msg.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {msg.status === 'Unread' && (
                      <button 
                        onClick={() => handleMarkReplied(msg._id)}
                        className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded hover:bg-primary-dark transition-colors"
                      >
                        Mark as Replied
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
