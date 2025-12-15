import { useMemo } from "react";
import { Dimensions } from "react-native";
import { isSameDay } from "../utils/dateUtils";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const RANGE_OPTIONS = [
  { key: "today", label: "Bugün" },
  { key: "7d", label: "7 Gün" },
  { key: "30d", label: "30 Gün" },
  { key: "all", label: "Tümü" },
];

function getPieColor(index) {
  const colorsArr = ["#3b82f6", "#22c55e", "#f97316", "#e11d48", "#a855f7"];
  return colorsArr[index % colorsArr.length];
}

export function useReportsStats({ sessions, range, colors }) {
  const filteredSessions = useMemo(() => {
    if (range === "all") return sessions;

    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    if (range === "today") {
      return sessions.filter((s) => isSameDay(s.startedAt, today));
    }

    const days = range === "7d" ? 7 : 30;
    const from = new Date(todayStart.getTime() - (days - 1) * MS_PER_DAY);

    return sessions.filter((s) => {
      const d = new Date(s.startedAt);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      return dayStart >= from && dayStart <= todayStart;
    });
  }, [sessions, range]);

  const hasSessions = sessions.length > 0;
  const hasFilteredSessions = filteredSessions.length > 0;

  const totalSec = useMemo(
    () => filteredSessions.reduce((sum, s) => sum + s.actualDurationSec, 0),
    [filteredSessions]
  );

  const sessionCount = filteredSessions.length;

  const averageSessionSec = useMemo(() => {
    if (sessionCount === 0) return 0;
    return totalSec / sessionCount;
  }, [totalSec, sessionCount]);

  const totalDistractions = useMemo(
    () =>
      filteredSessions.reduce((sum, s) => sum + (s.distractionCount || 0), 0),
    [filteredSessions]
  );

  const averageDistractionPerSession = useMemo(() => {
    if (sessionCount === 0) return 0;
    return totalDistractions / sessionCount;
  }, [totalDistractions, sessionCount]);

  const todayTotalSec = useMemo(() => {
    const today = new Date();
    return sessions
      .filter((s) => isSameDay(s.startedAt, today))
      .reduce((sum, s) => sum + s.actualDurationSec, 0);
  }, [sessions]);

  const allTimeTotalSec = useMemo(
    () => sessions.reduce((sum, s) => sum + s.actualDurationSec, 0),
    [sessions]
  );

  const chartDays = useMemo(() => {
    if (range === "today") return 1;
    if (range === "30d") return 30;
    return 7;
  }, [range]);

  const chartTitle = useMemo(() => {
    if (range === "today") return "Bugün Odaklanma Süresi (dk)";
    return `Son ${chartDays} Gün Odaklanma Süresi (dk)`;
  }, [range, chartDays]);

  const { chartLabels, chartValues } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const labels = new Array(chartDays).fill("");
    const values = new Array(chartDays).fill(0);

    for (let index = 0; index < chartDays; index++) {
      const offset = chartDays - 1 - index;
      const day = new Date(today.getTime() - offset * MS_PER_DAY);

      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dNum = day.getDate();
      const mNum = day.getMonth() + 1;

      labels[index] = `${dNum}/\n${mNum}`;

      sessions.forEach((s) => {
        const ts = new Date(s.startedAt);
        if (ts >= dayStart && ts <= dayEnd) {
          values[index] += s.actualDurationSec / 60;
        }
      });
    }

    return { chartLabels: labels, chartValues: values };
  }, [sessions, chartDays]);

  const hasWeeklyData = chartValues.some((v) => v > 0);

  const chartWidth = Math.max(SCREEN_WIDTH - 32, chartDays * 28);

  const categoryData = useMemo(() => {
    const map = {};
    filteredSessions.forEach((s) => {
      if (!map[s.category]) map[s.category] = 0;
      map[s.category] += s.actualDurationSec / 60;
    });

    return Object.entries(map).map(([name, value], idx) => ({
      name,
      population: value,
      color: getPieColor(idx),
      legendFontColor: "#f8fafc",
      legendFontSize: 12,
    }));
  }, [filteredSessions]);

  const formatMinutes = useMemo(() => {
    return (sec) => `${Math.round(sec / 60)} dk`;
  }, []);

  const formatMinutesWithHours = useMemo(() => {
    return (sec) => {
      const totalMin = Math.round(sec / 60);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      if (h <= 0) return `${totalMin} dk`;
      return `${h} sa ${m} dk`;
    };
  }, []);

  const badgeLabel = useMemo(() => {
    return RANGE_OPTIONS.find((r) => r.key === range)?.label;
  }, [range]);

  const barChartConfig = useMemo(
    () => ({
      backgroundColor: colors.card,
      backgroundGradientFrom: colors.card,
      backgroundGradientTo: colors.card,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(248, 250, 252, ${opacity})`,
      propsForBackgroundLines: {
        stroke: "rgba(148, 163, 184, 0.3)",
      },
    }),
    [colors.card]
  );

  const pieChartConfig = useMemo(
    () => ({
      backgroundColor: colors.card,
      backgroundGradientFrom: colors.card,
      backgroundGradientTo: colors.card,
      color: (opacity = 1) => `rgba(248, 250, 252, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(248, 250, 252, ${opacity})`,
    }),
    [colors.card]
  );

  return {
    RANGE_OPTIONS,
    badgeLabel,

    filteredSessions,
    hasSessions,
    hasFilteredSessions,

    totalSec,
    sessionCount,
    averageSessionSec,
    totalDistractions,
    averageDistractionPerSession,
    todayTotalSec,
    allTimeTotalSec,

    chartDays,
    chartTitle,
    chartLabels,
    chartValues,
    hasWeeklyData,
    chartWidth,
    categoryData,
    barChartConfig,
    pieChartConfig,

    formatMinutes,
    formatMinutesWithHours,

    screenWidth: SCREEN_WIDTH,
  };
}
