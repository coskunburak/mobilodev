import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

import StatsCard from "../components/StatsCard";
import { useSessions } from "../context/SessionProvider";
import { useReportsStats } from "../hooks/useReportsStats";
import colors from "../theme/colors";

export default function ReportsScreen() {
  const { sessions } = useSessions();
  const [range, setRange] = useState("7d");

  const {
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
    screenWidth,
  } = useReportsStats({ sessions, range, colors });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Raporlar</Text>
          <Text style={styles.subtitle}>
            Odaklanma istatistiklerin ve kategori dağılımın
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      </View>

      <View style={styles.rangeRow}>
        {RANGE_OPTIONS.map((opt) => {
          const active = opt.key === range;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setRange(opt.key)}
              style={[styles.rangeChip, active && styles.rangeChipActive]}
            >
              <Text style={[styles.rangeText, active && styles.rangeTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!hasSessions && (
        <Text style={styles.emptyText}>
          Henüz kayıtlı seans yok. Zamanlayıcıyı kullanmaya başladığında
          istatistikler burada görünecek.
        </Text>
      )}

      <View style={styles.summaryGrid}>
        <StatsCard
          title="Seçili Aralık Toplam"
          value={formatMinutesWithHours(totalSec)}
          subtitle={`Oturum sayısı: ${sessionCount}`}
          style={styles.summaryItem}
        />
        <StatsCard
          title="Ortalama Oturum Süresi"
          value={formatMinutes(averageSessionSec)}
          subtitle="Seçili aralıktaki oturumlar"
          style={styles.summaryItem}
        />
        <StatsCard
          title="Dikkat Dağınıklığı"
          value={`${totalDistractions} kez`}
          subtitle={`Oturum başına ort.: ${averageDistractionPerSession.toFixed(
            2
          )}`}
          style={styles.summaryItem}
        />
        <StatsCard
          title="Bugün / Tüm Zamanlar"
          value={`${formatMinutes(todayTotalSec)} • ${formatMinutesWithHours(
            allTimeTotalSec
          )}`}
          subtitle="Bugün / tüm zamanlar karşılaştırma"
          style={styles.summaryItem}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{chartTitle}</Text>
        {hasWeeklyData ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            <BarChart
              data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
              width={chartWidth}
              height={180}
              fromZero
              chartConfig={barChartConfig}
              style={{ borderRadius: 16 }}
            />
          </ScrollView>
        ) : (
          <Text style={styles.cardText}>
            Son {chartDays} gün için veri bulunmuyor.
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kategorilere Göre Dağılım</Text>
        {hasFilteredSessions && categoryData.length > 0 ? (
          <PieChart
            data={categoryData}
            width={screenWidth - 32}
            height={220}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="8"
            chartConfig={pieChartConfig}
          />
        ) : (
          <Text style={styles.cardText}>
            Seçili aralık için kategori verisi yok.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    marginTop: 48,
  },
  title: { fontSize: 24, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 4 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.18)",
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 11, color: colors.muted, fontWeight: "500" },

  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    padding: 4,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    marginBottom: 16,
  },
  rangeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  rangeChipActive: { backgroundColor: colors.primary },
  rangeText: { fontSize: 12, color: colors.muted },
  rangeTextActive: { color: "#ffffff", fontWeight: "600" },

  emptyText: { color: colors.muted, marginBottom: 12 },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  summaryItem: { flexBasis: "48%", flexGrow: 1 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  cardText: { color: colors.text, marginBottom: 4 },
});
