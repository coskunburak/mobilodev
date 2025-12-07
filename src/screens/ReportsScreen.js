import { useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import StatsCard from "../components/StatsCard";
import { useSessions } from "../context/SessionProvider";
import colors from "../theme/colors";
import { isSameDay } from "../utils/dateUtils";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const RANGE_OPTIONS = [
  { key: "today", label: "Bugün" },
  { key: "7d", label: "7 Gün" },
  { key: "30d", label: "30 Gün" },
  { key: "all", label: "Tümü" },
];

export default function ReportsScreen() {
  const { sessions } = useSessions();
  const [range, setRange] = useState("7d");

  // ------------------ FİLTRELENMİŞ SEANSLAR ------------------
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

  // ------------------ ÖZET METRİKLER ------------------
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
    () => filteredSessions.reduce((sum, s) => sum + (s.distractionCount || 0), 0),
    [filteredSessions]
  );

  const averageDistractionPerSession = useMemo(() => {
    if (sessionCount === 0) return 0;
    return totalDistractions / sessionCount;
  }, [totalDistractions, sessionCount]);

  // Bugün & tüm zamanlar (karşılaştırma kartı için)
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

  // ------------------ DİNAMİK GÜN SAYISI (GRAFİK) ------------------
  const chartDays = useMemo(() => {
    if (range === "30d") return 30;
    return 7;
  }, [range]);

  // Etiket + değer: seçilen gün sayısına göre son N günü üret
  const { chartLabels, chartValues } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // bugünün 00:00'ı

    const labels = new Array(chartDays).fill("");
    const values = new Array(chartDays).fill(0); // dakika cinsinden

    // index: 0..chartDays-1
    // 0 → en eski gün, chartDays-1 → bugün
    for (let index = 0; index < chartDays; index++) {
      const offset = chartDays - 1 - index; // bugün - offset
      const day = new Date(today.getTime() - offset * MS_PER_DAY);

      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dNum = day.getDate();
      const mNum = day.getMonth() + 1;

      // 30/\n11 formatı → slash + alt satırda ay
      labels[index] = `${dNum}/\n${mNum}`;

      // o güne ait tüm seansların süresini topla
      sessions.forEach((s) => {
        const ts = new Date(s.startedAt);
        if (ts >= dayStart && ts <= dayEnd) {
          values[index] += s.actualDurationSec / 60; // dk
        }
      });
    }

    return { chartLabels: labels, chartValues: values };
  }, [sessions, chartDays]);

  const hasWeeklyData = chartValues.some((v) => v > 0);

  // 30 günlük grafikte sıkışmayı azaltmak için genişliği dinamik yapalım
  const chartWidth = Math.max(SCREEN_WIDTH - 32, chartDays * 28);

  // ------------------ KATEGORİ PASTA GRAFİĞİ ------------------
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

  // ------------------ FORMAT HELPERS ------------------
  const formatMinutes = (sec) => `${Math.round(sec / 60)} dk`;
  const formatMinutesWithHours = (sec) => {
    const totalMin = Math.round(sec / 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h <= 0) return `${totalMin} dk`;
    return `${h} sa ${m} dk`;
  };

  // ------------------ UI ------------------
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Raporlar</Text>
          <Text style={styles.subtitle}>
            Odaklanma istatistiklerin ve kategori dağılımın
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {RANGE_OPTIONS.find((r) => r.key === range)?.label}
          </Text>
        </View>
      </View>

      {/* Range selector */}
      <View style={styles.rangeRow}>
        {RANGE_OPTIONS.map((opt) => {
          const active = opt.key === range;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setRange(opt.key)}
              style={[styles.rangeChip, active && styles.rangeChipActive]}
            >
              <Text
                style={[styles.rangeText, active && styles.rangeTextActive]}
              >
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

      {/* Özet grid (4 kart, 2x2) */}
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

      {/* Son N gün grafiği */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Son {chartDays} Gün Odaklanma Süresi (dk)
        </Text>
        {hasWeeklyData ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            <BarChart
              data={{
                labels: chartLabels,
                datasets: [{ data: chartValues }],
              }}
              width={chartWidth}
              height={180}
              fromZero
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
          </ScrollView>
        ) : (
          <Text style={styles.cardText}>
            Son {chartDays} gün için veri bulunmuyor.
          </Text>
        )}
      </View>

      {/* Kategori dağılımı */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kategorilere Göre Dağılım</Text>
        {hasFilteredSessions && categoryData.length > 0 ? (
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
          <Text style={styles.cardText}>
            Seçili aralık için kategori verisi yok.
          </Text>
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
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    marginTop: 48, // tab header altında düzgün dursun
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.18)",
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "500",
  },

  // range selector
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    padding: 4,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    marginBottom: 16,
  },
  rangeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  rangeChipActive: {
    backgroundColor: colors.primary,
  },
  rangeText: {
    fontSize: 12,
    color: colors.muted,
  },
  rangeTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },

  emptyText: {
    color: colors.muted,
    marginBottom: 12,
  },

  // summary cards
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  summaryItem: {
    flexBasis: "48%", // 2 sütun
    flexGrow: 1,
  },

  // generic card
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
  cardText: {
    color: colors.text,
    marginBottom: 4,
  },
});
