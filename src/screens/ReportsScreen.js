import { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { useSessions } from "../context/SessionProvider";
import colors from "../theme/colors";
import { getLastNDaysLabels, isSameDay } from "../utils/dateUtils";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ReportsScreen() {
  const { sessions } = useSessions();

  const todayTotal = useMemo(() => {
    const today = new Date();
    return sessions
      .filter((s) => isSameDay(s.startedAt, today))
      .reduce((sum, s) => sum + s.actualDurationSec, 0);
  }, [sessions]);

  const allTimeTotal = useMemo(
    () => sessions.reduce((sum, s) => sum + s.actualDurationSec, 0),
    [sessions]
  );

  const totalDistractions = useMemo(
    () => sessions.reduce((sum, s) => sum + (s.distractionCount || 0), 0),
    [sessions]
  );

  // Son 7 gün bar chart
  const last7Labels = getLastNDaysLabels(7);
  const last7Values = useMemo(() => {
    const today = new Date();
    const arr = new Array(7).fill(0);
    sessions.forEach((s) => {
      const d = new Date(s.startedAt);
      const diffDays = Math.floor(
        (today.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );
      if (diffDays >= 0 && diffDays < 7) {
        const index = 6 - diffDays; // label sırasına göre
        arr[index] += s.actualDurationSec / 60; // dakika
      }
    });
    return arr;
  }, [sessions]);

  // Kategorilere göre dağılım (pie chart)
  const categoryData = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      if (!map[s.category]) map[s.category] = 0;
      map[s.category] += s.actualDurationSec / 60; // dk
    });

    return Object.entries(map).map(([name, value], idx) => ({
      name,
      population: value,
      color: getPieColor(idx),
      legendFontColor: "#fff",
      legendFontSize: 12,
    }));
  }, [sessions]);

  const formatMinutes = (sec) => `${Math.round(sec / 60)} dk`;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Raporlar</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Genel İstatistikler</Text>
        <Text style={styles.cardText}>
          Bugün Toplam Odaklanma Süresi: {formatMinutes(todayTotal)}
        </Text>
        <Text style={styles.cardText}>
          Tüm Zamanların Toplam Odaklanma Süresi: {formatMinutes(allTimeTotal)}
        </Text>
        <Text style={styles.cardText}>
          Toplam Dikkat Dağınıklığı Sayısı: {totalDistractions}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Son 7 Gün Odaklanma Süresi (dk)</Text>
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
            labelColor: () => "#fff",
          }}
          style={{ borderRadius: 16 }}
        />
      </View>

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
