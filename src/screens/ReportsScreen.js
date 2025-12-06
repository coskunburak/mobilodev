// src/screens/ReportsScreen.js
import { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import StatsCard from "../components/StatsCard";
import { useSessions } from "../context/SessionProvider";
import colors from "../theme/colors";
import { getLastNDaysLabels, isSameDay } from "../utils/dateUtils";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export default function ReportsScreen() {
  const { sessions } = useSessions();
  const hasSessions = sessions.length > 0;

  // ---------- TEMEL METRİKLER ----------
  const todayTotalSec = useMemo(() => {
    const today = new Date();
    return sessions
      .filter((s) => isSameDay(s.startedAt, today))
      .reduce((sum, s) => sum + s.actualDurationSec, 0);
  }, [sessions]);

  const todaySessionCount = useMemo(() => {
    const today = new Date();
    return sessions.filter((s) => isSameDay(s.startedAt, today)).length;
  }, [sessions]);

  const allTimeTotalSec = useMemo(
    () => sessions.reduce((sum, s) => sum + s.actualDurationSec, 0),
    [sessions]
  );

  const totalDistractions = useMemo(
    () => sessions.reduce((sum, s) => sum + (s.distractionCount || 0), 0),
    [sessions]
  );

  const averageSessionSec = useMemo(() => {
    if (sessions.length === 0) return 0;
    return allTimeTotalSec / sessions.length;
  }, [allTimeTotalSec, sessions.length]);

  const averageDistractionPerSession = useMemo(() => {
    if (sessions.length === 0) return 0;
    return totalDistractions / sessions.length;
  }, [totalDistractions, sessions.length]);

  // ---------- SON 7 GÜN BAR CHART ----------
  const last7Labels = getLastNDaysLabels(7);

  const last7Values = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    const arr = new Array(7).fill(0); // dk

    sessions.forEach((s) => {
      const d = new Date(s.startedAt);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((todayStart - dayStart) / MS_PER_DAY);
      if (diffDays >= 0 && diffDays < 7) {
        const index = 6 - diffDays; // labels ile hizalama
        arr[index] += s.actualDurationSec / 60; // dakika
      }
    });
    return arr;
  }, [sessions]);

  const hasWeeklyData = last7Values.some((v) => v > 0);

  // ---------- KATEGORİ PIE CHART ----------
  const categoryData = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      if (!map[s.category]) map[s.category] = 0;
      map[s.category] += s.actualDurationSec / 60; // dk
    });

    return Object.entries(map).map(([name, value], idx) => ({
      name,
      population: value, // dk
      color: getPieColor(idx),
      legendFontColor: "#f8fafc",
      legendFontSize: 12,
    }));
  }, [sessions]);

  // ---------- FORMAT HELPERS ----------
  const formatMinutes = (sec) => `${Math.round(sec / 60)} dk`;
  const formatMinutesWithHours = (sec) => {
    const totalMin = Math.round(sec / 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h <= 0) return `${totalMin} dk`;
    return `${h} sa ${m} dk`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Raporlar</Text>

      {/* Eğer hiç oturum yoksa kısa bilgi */}
      {!hasSessions && (
        <Text style={styles.emptyText}>
          Henüz kayıtlı seans yok. Zamanlayıcıyı kullanmaya başladığında
          istatistikler burada görünecek.
        </Text>
      )}

      {/* ÖZET KARTLAR */}
      <StatsCard
        title="Bugün Toplam Odaklanma"
        value={formatMinutesWithHours(todayTotalSec)}
        subtitle={`Oturum sayısı: ${todaySessionCount}`}
      />
      <StatsCard
        title="Tüm Zamanlar Toplam Odaklanma"
        value={formatMinutesWithHours(allTimeTotalSec)}
        subtitle={`Toplam oturum: ${sessions.length}`}
      />
      <StatsCard
        title="Ortalama Oturum Süresi"
        value={formatMinutes(averageSessionSec)}
        subtitle="Tüm oturumların ortalaması"
      />
      <StatsCard
        title="Dikkat Dağınıklığı"
        value={`${totalDistractions} kez`}
        subtitle={`Oturum başına ortalama: ${averageDistractionPerSession.toFixed(
          2
        )}`}
      />

      {/* SON 7 GÜN GRAFİĞİ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Son 7 Gün Odaklanma Süresi (dk)</Text>
        {hasWeeklyData ? (
          <BarChart
            data={{
              labels: last7Labels,
              datasets: [{ data: last7Values }],
            }}
            width={SCREEN_WIDTH - 32}
            height={220}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) =>
                `rgba(248, 250, 252, ${opacity})`,
              propsForBackgroundLines: {
                stroke: "rgba(148, 163, 184, 0.3)",
              },
            }}
            style={{ borderRadius: 16 }}
          />
        ) : (
          <Text style={styles.cardText}>Son 7 gün için veri bulunmuyor.</Text>
        )}
      </View>

      {/* KATEGORİ PASTA GRAFİĞİ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kategorilere Göre Dağılım</Text>
        {categoryData.length > 0 ? (
          <PieChart
            data={categoryData}
            width={SCREEN_WIDTH - 32}
            height={220}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="8"
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              color: (opacity = 1) => `rgba(248, 250, 252, ${opacity})`,
              labelColor: (opacity = 1) =>
                `rgba(248, 250, 252, ${opacity})`,
            }}
          />
        ) : (
          <Text style={styles.cardText}>Henüz kayıtlı seans yok.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function getPieColor(index) {
  const colorsArr = ["#3b82f6", "#22c55e", "#f97316", "#e11d48", "#a855f7"];
  return colorsArr[index % colorsArr.length];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  emptyText: {
    color: colors.muted,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  cardText: {
    color: colors.text,
    marginBottom: 4,
  },
});
