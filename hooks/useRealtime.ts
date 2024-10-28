// useRealtime.ts

import { useContext } from 'react';
import { RealtimeContext } from '../components/context/RealtimeContext';

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
