import { RECENT_ACTIVITIES } from "../types/constants";
import { Activity } from "../types";

export const useDashboardData = () => {
  const userStats = {
    userName: "Zaire",
    coinsAmount: 470,
    bottlesRecycled: 47,
  };

  const getRecentActivities = (): Activity[] => {
    return RECENT_ACTIVITIES;
  };

  return {
    userStats,
    activities: getRecentActivities(),
  };
};
