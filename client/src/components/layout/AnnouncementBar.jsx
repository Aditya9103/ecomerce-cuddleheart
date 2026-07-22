import { Gift } from 'lucide-react';
import { useGetStoreSettingsQuery } from '../../store/slices/settingsApiSlice';

const AnnouncementBar = () => {
  const { data: settings, isLoading } = useGetStoreSettingsQuery();

  if (isLoading) return <div className="bg-primary-light py-2 h-9 w-full"></div>;

  const announcement = settings?.announcementMessages?.[0] || 'Welcome to Cuddle Hearts!';

  return (
    <div className="bg-primary-light text-heading py-2 text-sm font-medium w-full text-center flex items-center justify-center gap-2">
      <Gift size={16} className="text-primary" />
      <span>{announcement}</span>
    </div>
  );
};

export default AnnouncementBar;
