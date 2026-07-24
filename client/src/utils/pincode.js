export const fetchPincodeDetails = async (pincode) => {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    
    if (data && data[0].Status === 'Success') {
      const postOffice = data[0].PostOffice[0];
      return {
        success: true,
        city: postOffice.District || postOffice.Region || '',
        state: postOffice.State || '',
        area: postOffice.Name || ''
      };
    }
    return { success: false, error: 'Invalid pincode or no data found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
