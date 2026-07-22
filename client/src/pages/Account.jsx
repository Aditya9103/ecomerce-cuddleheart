import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Edit3, Trash2, Plus, HelpCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { 
  useGetProfileQuery, 
  useUpdateProfileMutation,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation
} from '../store/slices/authApiSlice';
import toast from 'react-hot-toast';

const Account = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [addressForm, setAddressForm] = useState({
    _id: '', fullName: '', phone: '', pincode: '', flatHouse: '', areaStreet: '', landmark: '', city: '', state: '', label: 'Home', isDefault: false
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const dispatch = useDispatch();
  
  // Data Fetching
  const { data: profile, isLoading, refetch } = useGetProfileQuery(undefined, {
    onSuccess: (data) => {
      setName(data.name);
      setPhone(data.phone || '');
    }
  });

  // Mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [addAddress, { isLoading: isAddingAddress }] = useAddAddressMutation();
  const [updateAddress, { isLoading: isUpdatingAddr }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({ name, phone, password: password || undefined }).unwrap();
      dispatch(setCredentials({ ...res }));
      setPassword('');
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Error updating profile');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({ _id: '', fullName: '', phone: '', pincode: '', flatHouse: '', areaStreet: '', landmark: '', city: '', state: '', label: 'Home', isDefault: false });
    setIsEditingAddress(false);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (addressForm._id) {
        await updateAddress({ id: addressForm._id, data: addressForm }).unwrap();
        toast.success('Address updated');
      } else {
        await addAddress(addressForm).unwrap();
        toast.success('Address added');
      }
      resetAddressForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Error saving address');
    }
  };

  const handlePincodeChange = async (e) => {
    const value = e.target.value;
    setAddressForm(prev => ({ ...prev, pincode: value }));
    
    if (value.length === 6 && /^\d+$/.test(value)) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await response.json();
        if (data && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setAddressForm(prev => ({
            ...prev,
            city: postOffice.District || postOffice.Region || '',
            state: postOffice.State || '',
            areaStreet: prev.areaStreet ? prev.areaStreet : postOffice.Name || ''
          }));
        } else {
          console.error("Pincode API returned error status:", data);
        }
      } catch (error) {
        console.error("Failed to fetch pincode details:", error);
      }
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id).unwrap();
        refetch();
      } catch (err) {
        toast.error('Error deleting address');
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading text-heading mb-8">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-72 flex flex-col gap-3">
          <button 
            className={`flex items-center gap-3 text-left px-5 py-4 rounded-2xl font-bold transition-all shadow-sm ${activeTab === 'profile' ? 'bg-primary text-white border-transparent' : 'bg-white hover:bg-gray-50 border border-gray-100 text-gray-700 hover:border-primary/30'}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} className={activeTab === 'profile' ? 'text-white' : 'text-primary'} />
            Profile Settings
          </button>
          <button 
            className={`flex items-center gap-3 text-left px-5 py-4 rounded-2xl font-bold transition-all shadow-sm ${activeTab === 'addresses' ? 'bg-primary text-white border-transparent' : 'bg-white hover:bg-gray-50 border border-gray-100 text-gray-700 hover:border-primary/30'}`}
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin size={20} className={activeTab === 'addresses' ? 'text-white' : 'text-primary'} />
            Address Book
          </button>
          
          <Link 
            to="/help"
            className="flex items-center gap-3 text-left px-5 py-4 rounded-2xl font-bold transition-all shadow-sm bg-white hover:bg-gray-50 border border-gray-100 text-gray-700 hover:border-primary/30 mt-4"
          >
            <HelpCircle size={20} className="text-primary" />
            Help Center
          </Link>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Profile Settings</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input type="email" value={profile?.email || ''} readOnly className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none text-gray-500 font-medium cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={name || profile?.name || ''} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone || profile?.phone || ''} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">New Password <span className="normal-case tracking-normal font-normal text-gray-400">(leave blank to keep current)</span></label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isUpdatingProfile}
                  className="bg-primary text-white font-bold py-4 px-10 rounded-full hover:bg-primary-dark transition-all disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-4"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* ADDRESS TAB */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-heading font-bold text-gray-900">Address Book</h2>
                {!isEditingAddress && (
                  <button 
                    onClick={() => setIsEditingAddress(true)}
                    className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold hover:bg-primary hover:text-white transition-colors"
                  >
                    <Plus size={16} /> Add Address
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 mb-8">
                  <h3 className="font-heading font-bold text-xl mb-6 text-gray-900">{addressForm._id ? 'Edit Address' : 'Add New Address'}</h3>
                  <form onSubmit={handleAddressSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                        <input required type="text" value={addressForm.fullName} onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mobile Number</label>
                        <input required type="text" value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pincode</label>
                        <input required type="text" maxLength={6} value={addressForm.pincode} onChange={handlePincodeChange} placeholder="Enter 6-digit Pincode" className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Flat, House no., Building, Company, Apartment</label>
                        <input required type="text" value={addressForm.flatHouse} onChange={(e) => setAddressForm({...addressForm, flatHouse: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Area, Street, Sector, Village</label>
                        <input required type="text" value={addressForm.areaStreet} onChange={(e) => setAddressForm({...addressForm, areaStreet: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Landmark <span className="normal-case tracking-normal font-normal text-gray-400">(Optional)</span></label>
                        <input type="text" value={addressForm.landmark} onChange={(e) => setAddressForm({...addressForm, landmark: e.target.value})} placeholder="e.g. near Apollo Hospital" className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Town/City</label>
                        <input required type="text" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">State</label>
                        <input required type="text" value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Address Type</label>
                        <div className="flex gap-4">
                          {['Home', 'Work', 'Other'].map(type => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="label" value={type} checked={addressForm.label === type} onChange={(e) => setAddressForm({...addressForm, label: e.target.value})} className="w-4 h-4 accent-primary" />
                              <span className="font-medium text-gray-700">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <label className="flex items-center gap-3 mt-2 cursor-pointer p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-max">
                      <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                      <span className="font-bold text-gray-700">Set as default delivery address</span>
                    </label>

                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <button type="submit" disabled={isAddingAddress || isUpdatingAddr} className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-dark transition-all disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        Save Address
                      </button>
                      <button type="button" onClick={resetAddressForm} className="text-gray-500 font-bold hover:text-gray-900 py-3 px-6 transition-colors rounded-full hover:bg-gray-100">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {profile?.addresses?.length === 0 ? (
                    <div className="col-span-2 text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                      <MapPin size={40} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium mb-4">You haven't saved any delivery addresses yet.</p>
                      <button onClick={() => setIsEditingAddress(true)} className="bg-white border border-gray-200 font-bold text-gray-700 px-6 py-2 rounded-full shadow-sm hover:shadow hover:text-primary transition-all">Add Your First Address</button>
                    </div>
                  ) : (
                    profile?.addresses?.map(addr => (
                      <div key={addr._id} className={`p-6 rounded-3xl border ${addr.isDefault ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-gray-200 bg-white shadow-sm'} relative group hover:border-primary/50 transition-all`}>
                        {addr.isDefault && <span className="absolute -top-3 -right-3 text-[10px] font-black tracking-widest uppercase bg-primary text-white px-3 py-1.5 rounded-full shadow-md z-10">Primary</span>}
                        
                        <div className="flex items-start gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${addr.isDefault ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <MapPin size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{addr.fullName} <span className="text-sm font-medium text-gray-500 ml-2 py-0.5 px-2 bg-gray-100 rounded-md">{addr.label}</span></h4>
                            <p className="text-sm font-medium text-gray-500 mt-1">{addr.phone}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                          {addr.flatHouse}, {addr.areaStreet} <br/>
                          {addr.landmark && `Landmark: ${addr.landmark}`} {addr.landmark && <br/>}
                          {addr.city}, {addr.state} <span className="font-bold">{addr.pincode}</span>
                        </p>
                        
                        <div className="flex gap-3 text-sm border-t border-gray-100 pt-4">
                          <button 
                            onClick={() => {
                              setAddressForm(addr);
                              setIsEditingAddress(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2 rounded-xl transition-colors"
                          >
                            <Edit3 size={16} /> Edit
                          </button>
                          <button onClick={() => handleDeleteAddress(addr._id)} className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-xl transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Account;
