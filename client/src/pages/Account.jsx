import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Edit3, Trash2, Plus, HelpCircle, ChevronRight, Phone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation
} from '../store/slices/authApiSlice';
import { fetchPincodeDetails } from '../utils/pincode';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', label: 'Profile Settings', icon: User },
  { id: 'addresses', label: 'Address Book', icon: MapPin }
];

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
      const details = await fetchPincodeDetails(value);
      if (details.success) {
        setAddressForm(prev => ({
          ...prev,
          city: details.city,
          state: details.state,
          areaStreet: prev.areaStreet ? prev.areaStreet : details.area
        }));
      } else {
        console.error("Failed to fetch pincode details:", details.error);
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse mb-8" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 h-40 bg-gray-100 rounded-xl animate-pulse" />
          <div className="flex-1 h-80 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Shared input styling so every field in the file stays visually consistent
  const inputClass =
    "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900">My Account</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile details and delivery addresses</p>
      </div>

      {/* Mobile tab bar */}
      <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${activeTab === id
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-600 border-gray-200'
              }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
        <Link
          to="/help"
          className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 bg-white text-gray-600"
        >
          <HelpCircle size={15} /> Help
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar nav (desktop) */}
        <div className="hidden md:flex w-full md:w-64 flex-col gap-1 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === id ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={17} className={activeTab === id ? 'text-white' : 'text-primary'} />
                {label}
                <ChevronRight size={15} className={`ml-auto ${activeTab === id ? 'text-white/70' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>

          <Link
            to="/help"
            className="flex items-center gap-3 text-left px-4 py-3 mt-3 rounded-xl text-sm font-semibold bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 transition-colors"
          >
            <HelpCircle size={17} className="text-primary" />
            Help Center
          </Link>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-5 md:p-8 min-w-0">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-heading font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Profile Settings</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-lg">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" value={profile?.email || ''} readOnly className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed focus:ring-0 focus:border-gray-200`} />
                </div>
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={name || profile?.name || ''}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="text"
                    value={phone || profile?.phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    New Password <span className="normal-case tracking-normal font-normal text-gray-400">(leave blank to keep current)</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-primary text-white font-semibold text-sm py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 mt-2"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* ADDRESS TAB */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-heading font-bold text-gray-900">Address Book</h2>
                {!isEditingAddress && (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-4 py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
                  >
                    <Plus size={15} /> Add Address
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <div className="bg-gray-50 p-5 md:p-6 rounded-xl border border-gray-200 mb-6">
                  <h3 className="font-heading font-bold text-base mb-5 text-gray-900">
                    {addressForm._id ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <form onSubmit={handleAddressSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className={labelClass}>Full Name</label>
                        <input required type="text" value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Mobile Number</label>
                        <input required type="text" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Pincode</label>
                        <input required type="text" maxLength={6} value={addressForm.pincode} onChange={handlePincodeChange} placeholder="6-digit pincode" className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Flat, House no., Building, Company, Apartment</label>
                        <input required type="text" value={addressForm.flatHouse} onChange={(e) => setAddressForm({ ...addressForm, flatHouse: e.target.value })} className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Area, Street, Sector, Village</label>
                        <input required type="text" value={addressForm.areaStreet} onChange={(e) => setAddressForm({ ...addressForm, areaStreet: e.target.value })} className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>
                          Landmark <span className="normal-case tracking-normal font-normal text-gray-400">(Optional)</span>
                        </label>
                        <input type="text" value={addressForm.landmark} onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} placeholder="e.g. near Apollo Hospital" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Town/City</label>
                        <input required type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>State</label>
                        <input required type="text" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Address Type</label>
                        <div className="flex gap-2">
                          {['Home', 'Work', 'Other'].map((type) => (
                            <label
                              key={type}
                              className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${addressForm.label === type
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                }`}
                            >
                              <input type="radio" name="label" value={type} checked={addressForm.label === type} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} className="w-3.5 h-3.5 accent-primary" />
                              {type}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer p-3.5 border border-gray-200 rounded-lg hover:bg-white transition-colors w-max bg-white">
                      <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="w-4 h-4 accent-primary rounded" />
                      <span className="text-sm font-semibold text-gray-700">Set as default delivery address</span>
                    </label>

                    <div className="flex gap-3 pt-5 border-t border-gray-200">
                      <button type="submit" disabled={isAddingAddress || isUpdatingAddr} className="bg-primary text-white font-semibold text-sm py-2.5 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                        Save Address
                      </button>
                      <button type="button" onClick={resetAddressForm} className="text-gray-500 font-semibold text-sm hover:text-gray-900 py-2.5 px-5 transition-colors rounded-lg hover:bg-gray-100">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {profile?.addresses?.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <MapPin size={32} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm mb-4">You haven't saved any delivery addresses yet.</p>
                      <button onClick={() => setIsEditingAddress(true)} className="bg-white border border-gray-200 font-semibold text-sm text-gray-700 px-5 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors">
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    profile?.addresses?.map((addr) => (
                      <div
                        key={addr._id}
                        className={`p-5 rounded-xl border relative transition-colors ${addr.isDefault ? 'border-primary bg-primary/[0.03]' : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                      >
                        {addr.isDefault && (
                          <span className="absolute top-4 right-4 text-[10px] font-bold tracking-wide uppercase bg-primary text-white px-2 py-1 rounded-md">
                            Default
                          </span>
                        )}

                        <div className="flex items-center gap-2 mb-1 pr-16">
                          <h4 className="font-bold text-gray-900 text-sm">{addr.fullName}</h4>
                          <span className="text-xs font-medium text-gray-500 py-0.5 px-2 bg-gray-100 rounded-md shrink-0">{addr.label}</span>
                        </div>
                        <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                          <Phone size={12} /> {addr.phone}
                        </p>

                        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                          {addr.flatHouse}, {addr.areaStreet}
                          <br />
                          {addr.landmark && (
                            <>
                              Landmark: {addr.landmark}
                              <br />
                            </>
                          )}
                          {addr.city}, {addr.state} <span className="font-semibold text-gray-800">{addr.pincode}</span>
                        </p>

                        <div className="flex gap-2 text-sm border-t border-gray-100 pt-4">
                          <button
                            onClick={() => {
                              setAddressForm(addr);
                              setIsEditingAddress(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold py-2 rounded-lg transition-colors"
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          <button onClick={() => handleDeleteAddress(addr._id)} className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                            <Trash2 size={14} />
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