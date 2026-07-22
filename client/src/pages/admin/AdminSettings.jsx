import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } from '../../store/slices/settingsApiSlice';
import { Settings, Save } from 'lucide-react';

const AdminSettings = () => {
  const { data: settings, isLoading } = useGetStoreSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateStoreSettingsMutation();

  const [formData, setFormData] = useState({
    storeName: '',
    contactEmail: '',
    contactPhone: '',
    freeShippingThreshold: 0,
    shippingCharge: 0,
    codEnabled: true,
    onlineEnabled: false,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || '',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        freeShippingThreshold: settings.freeShippingThreshold || 0,
        shippingCharge: settings.shippingCharge || 0,
        codEnabled: settings.codEnabled !== undefined ? settings.codEnabled : true,
        onlineEnabled: settings.onlineEnabled !== undefined ? settings.onlineEnabled : false,
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData).unwrap();
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="text-primary" />
        <h1 className="text-2xl font-bold">Store Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-8">
        
        {/* General Info */}
        <div>
          <h2 className="text-lg font-bold mb-4 border-b border-gray-100 pb-2">General Information</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Store Name</label>
              <input 
                type="text" 
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="p-3 border border-gray-200 rounded-xl focus:border-primary outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Contact Email</label>
              <input 
                type="email" 
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="p-3 border border-gray-200 rounded-xl focus:border-primary outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Contact Phone</label>
              <input 
                type="text" 
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="p-3 border border-gray-200 rounded-xl focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div>
          <h2 className="text-lg font-bold mb-4 border-b border-gray-100 pb-2">Shipping Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Standard Shipping Charge (₹)</label>
              <input 
                type="number" 
                name="shippingCharge"
                value={formData.shippingCharge}
                onChange={handleChange}
                className="p-3 border border-gray-200 rounded-xl focus:border-primary outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Free Shipping Threshold (₹)</label>
              <input 
                type="number" 
                name="freeShippingThreshold"
                value={formData.freeShippingThreshold}
                onChange={handleChange}
                className="p-3 border border-gray-200 rounded-xl focus:border-primary outline-none"
              />
              <p className="text-xs text-gray-500">Orders above this amount will get free shipping.</p>
            </div>
          </div>
        </div>

        {/* Payments */}
        <div>
          <h2 className="text-lg font-bold mb-4 border-b border-gray-100 pb-2">Payment Methods</h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <input 
                type="checkbox" 
                name="codEnabled"
                checked={formData.codEnabled}
                onChange={handleChange}
                className="w-5 h-5 accent-primary"
              />
              <div>
                <p className="font-bold text-gray-900">Cash on Delivery (COD)</p>
                <p className="text-sm text-gray-500">Allow customers to pay when order is delivered.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <input 
                type="checkbox" 
                name="onlineEnabled"
                checked={formData.onlineEnabled}
                onChange={handleChange}
                className="w-5 h-5 accent-primary"
              />
              <div>
                <p className="font-bold text-gray-900">Online Payments (Razorpay)</p>
                <p className="text-sm text-gray-500">Enable Razorpay integration for checkout.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isUpdating}
            className="btn-primary px-8 py-3 flex items-center gap-2"
          >
            <Save size={18} /> {isUpdating ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminSettings;
