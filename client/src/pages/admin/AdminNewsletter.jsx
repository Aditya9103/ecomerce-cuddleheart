import { useGetSubscribersQuery } from '../../store/slices/newsletterApiSlice';
import { Download, Mail } from 'lucide-react';

const AdminNewsletter = () => {
  const { data: subscribers, isLoading } = useGetSubscribersQuery();

  const exportToCSV = () => {
    if (!subscribers || subscribers.length === 0) return;
    
    const headers = ['Email', 'Subscribed At', 'Status'];
    const rows = subscribers.map(sub => [
      sub.email,
      new Date(sub.subscribedAt).toLocaleDateString(),
      'Active'
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";
    rows.forEach(rowArray => {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cuddle-hearts-newsletter.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div>Loading subscribers...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="text-primary"/> Newsletter Subscribers</h1>
        <button onClick={exportToCSV} className="bg-white border border-gray-200 text-gray-700 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-bold border-b border-gray-100">Email</th>
                <th className="p-4 font-bold border-b border-gray-100">Subscribed At</th>
                <th className="p-4 font-bold border-b border-gray-100">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers?.map((sub) => (
                <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-900">{sub.email}</td>
                  <td className="p-4 text-sm text-gray-600">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                  <td className="p-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {subscribers?.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-500">No subscribers yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletter;
