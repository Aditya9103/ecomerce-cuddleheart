import { useGetDashboardStatsQuery } from '../../store/slices/orderApiSlice';
import { Package, Users, IndianRupee, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { data: stats, isLoading } = useGetDashboardStatsQuery();

  if (isLoading) return <div>Loading dashboard...</div>;

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats?.totalSales?.toLocaleString() || 0}`, icon: <IndianRupee size={24} className="text-green-500" />, bg: 'bg-green-50' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: <ShoppingCart size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Total Customers', value: stats?.totalCustomers || 0, icon: <Users size={24} className="text-purple-500" />, bg: 'bg-purple-50' },
    { title: 'Top Products', value: stats?.topProducts?.length || 0, icon: <Package size={24} className="text-orange-500" />, bg: 'bg-orange-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">{card.title}</p>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="flex flex-col gap-4">
            {stats?.recentOrders?.map(order => (
              <div key={order._id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900">#{order._id.substring(0, 8)}</p>
                  <p className="text-sm text-gray-500">{order.user?.name || 'Guest'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{order.totalPrice}</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : 
                    order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
            {stats?.recentOrders?.length === 0 && <p className="text-gray-500">No orders yet.</p>}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Top Products</h2>
            <Link to="/admin/products" className="text-sm font-bold text-primary hover:underline">Manage</Link>
          </div>
          <div className="flex flex-col gap-4">
            {stats?.topProducts?.map(product => (
              <div key={product._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded bg-gray-50 mix-blend-multiply" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">₹{product.price}</p>
                </div>
                <div className="text-sm font-bold text-gray-400">
                  Rank #{product.bestSellerRank}
                </div>
              </div>
            ))}
            {stats?.topProducts?.length === 0 && <p className="text-gray-500">No products found.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
