// useConnectionStatus.ts

import { useRealtime } from "./useRealtime";

export const useConnectionStatus = () => {
	const { connected } = useRealtime();
	return connected;
};
