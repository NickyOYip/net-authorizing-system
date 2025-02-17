import { useContext } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../store/dataStore';
import { fetchUserProfile } from '../services/fetchData';

export const useUserProfile = () => {
  const { data, updateData } = useContext(DataContext);

  const refetchUserProfile = async () => {
    if (!data.account || !data.userContractAddress) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const userProfile = await fetchUserProfile(
        provider,
        data.userContractAddress,
        data.account
      );
      updateData('userProfile', userProfile);
    } catch (err) {
      console.error('Error refetching user profile:', err);
    }
  };

  return { refetchUserProfile };
};
