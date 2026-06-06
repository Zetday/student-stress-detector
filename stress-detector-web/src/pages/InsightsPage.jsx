import { useEffect, useState, useMemo, useCallback } from "react";
import AcademicCondition from "../components/Insights/AcademicCondition";
import AINarrativeCard from "../components/Insights/AINarrativeCard";
import PriorityCard from "../components/Insights/PriorityCard";
import StatsCard from "../components/Insights/StatsCard";
import StressIntensityChart from "../components/Insights/StressIntensityChart";
import WeeklyActivityChart from "../components/Insights/WeeklyActivityChart";
import Layout from "../../layouts/Layout";
import api from "../services/api";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import { getActivityHistory } from "../services/activityService";

const getNumberField = (data, snakeCaseName, camelCaseName) => {
  const value = data?.[snakeCaseName] ?? data?.[camelCaseName];
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getAverage = (items, selector) => {
  const values = items.map(selector).filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const getTrendPercentage = (items, selector) => {
  if (items.length < 2) {
    return 0;
  }

  const sortedItems = [...items].sort((a, b) => a.datetime - b.datetime);
  const midpoint = Math.ceil(sortedItems.length / 2);
  const firstAverage = getAverage(sortedItems.slice(0, midpoint), selector);
  const lastAverage = getAverage(sortedItems.slice(midpoint), selector);

  if (!firstAverage || !lastAverage) {
    return 0;
  }

  return Math.round(((lastAverage - firstAverage) / firstAverage) * 100);
};



const normalizeInsight = (insight) => {
  if (!insight) {
    return null;
  }

  const insightText = insight.insight_text ?? insight.insightText ?? insight.description ?? "";

  return {
    id: insight.id,
    insight_text: typeof insightText === "string" ? insightText.trim() : "",
    created_at: insight.created_at,
  };
};

const getInsightFromResponse = (responseData) => {
  const data = responseData?.data ?? responseData;
  const insight =
    data?.insight ??
    data?.latestInsight ??
    data?.insights?.[0] ??
    (Array.isArray(data) ? data[0] : data);

  return normalizeInsight(insight);
};

const fetchLatestDatabaseInsight = async () => {
  try {
    const latestResponse = await api.get("/insights/latest");
    const latestInsight = getInsightFromResponse(latestResponse.data);

    if (latestInsight?.insight_text) {
      return latestInsight;
    }
  } catch (latestInsightError) {
    console.warn("Failed to fetch latest insight:", latestInsightError);
  }

  try {
    const listResponse = await api.get("/insights", {
      params: { limit: 1, offset: 0 },
    });
    return getInsightFromResponse(listResponse.data);
  } catch (insightListError) {
    console.warn("Failed to fetch insights list:", insightListError);
    return null;
  }
};

const fetchLatestDatabaseRecommendations = async () => {
  try {
    try {
      await api.get("/recommendations/latest");
    } catch (triggerError) {
      console.warn("Failed to trigger latest recommendation auto-healing:", triggerError);
    }

    const response = await api.get("/recommendations", {
      params: { limit: 10, offset: 0 },
    });
    const recs = response.data?.data?.recommendations ?? response.data?.recommendations ?? [];
    if (recs.length > 0) {
      const latestSummaryId = recs[0].summary_id;
      if (latestSummaryId) {
        return recs.filter((rec) => rec.summary_id === latestSummaryId);
      }
      const latestCreatedAt = recs[0].created_at;
      return recs.filter((rec) => rec.created_at === latestCreatedAt);
    }
    return [];
  } catch (err) {
    console.warn("Failed to fetch recommendations:", err);
    return [];
  }
};

const formatDateRange = (startStr, endStr, locale) => {
  if (!startStr || !endStr) return "";
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

  const options = { day: "numeric", month: "short", year: "numeric" };
  return `${start.toLocaleDateString(locale, options)} - ${end.toLocaleDateString(locale, options)}`;
};

const fetchLatestWeeklySummary = async () => {
  try {
    const response = await api.get("/weekly-summaries/latest");
    return response.data?.data?.summary ?? response.data?.summary ?? null;
  } catch (err) {
    console.warn("Failed to fetch latest weekly summary:", err);
    return null;
  }
};

function InsightPage() {
  const { user } = useUser();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("");
  const [insightData, setInsightData] = useState(null);
  const [todayRecommendations, setTodayRecommendations] = useState([]);
  const [narrativeInsight, setNarrativeInsight] = useState(null);
  const [weeklyActivityData, setWeeklyActivityData] = useState([]);
  const [academicConditionData, setAcademicConditionData] = useState([]);
  const [stressIntensityData, setStressIntensityData] = useState([]);

  const fetchInsightsData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const historyResponse = await getActivityHistory();

      if (historyResponse.error) {
        throw new Error(historyResponse.message);
      }

      const history = historyResponse.data || [];
      const completedHistory = history
        .filter((item) => item.status !== "Draft")
        .sort((a, b) => b.datetime - a.datetime);
      const latestSevenItems = completedHistory.slice(0, 7);
      const latestItem = completedHistory[0];
      const latestActivity = latestItem
        ? {
            ...latestItem.activity,
            ...latestItem.prediction,
            stress_score: latestItem.stressScore,
            stressScore: latestItem.stressScore,
          }
        : null;

      let latestWeeklySummary = null;
      try {
        latestWeeklySummary = await fetchLatestWeeklySummary();
      } catch (summaryErr) {
        console.warn("Failed to fetch latest summary:", summaryErr);
      }

      let weeklySummary;
      if (latestWeeklySummary) {
        weeklySummary = {
          avgStressScore: Math.round(latestWeeklySummary.avg_stress_score),
          avgSleepHours: Number(latestWeeklySummary.avg_sleep_hours),
          avgAssignmentLoad: Number(latestWeeklySummary.avg_assignment_load),
          avgDeadlinePressure: Number(latestWeeklySummary.avg_deadline_pressure),
          avgPhysicalActivity: Number(latestWeeklySummary.avg_physical_activity),
          avgStudyHours: Number(latestWeeklySummary.avg_study_hours),
          avgSocialMediaHours: Number(latestWeeklySummary.avg_social_media_hours),
          stressTrend: getTrendPercentage(latestSevenItems, (item) => item.stressScore),
          sleepTrend: getTrendPercentage(latestSevenItems, (item) =>
            getNumberField(item.activity, "sleep_hours", "sleepHours"),
          ),
          taskLoadTrend: getTrendPercentage(latestSevenItems, (item) =>
            getNumberField(item.activity, "assignment_load", "assignmentLoad"),
          ),
          physicalActivityTrend: getTrendPercentage(latestSevenItems, (item) =>
            getNumberField(item.activity, "physical_activity_minutes", "physicalActivityMinutes"),
          ),
        };

        const range = formatDateRange(latestWeeklySummary.period_start, latestWeeklySummary.period_end, t.DashboardDateLocale);
        setDateRange(range);
      } else {
        weeklySummary = {
          avgStressScore: Math.round(getAverage(latestSevenItems, (item) => item.stressScore)),
          avgSleepHours: getAverage(latestSevenItems, (item) =>
            getNumberField(item.activity, "sleep_hours", "sleepHours"),
          ),
          avgAssignmentLoad: getAverage(latestSevenItems, (item) =>
            getNumberField(item.activity, "assignment_load", "assignmentLoad"),
          ),
          avgDeadlinePressure: getAverage(latestSevenItems, (item) =>
            getNumberField(item.activity, "deadline_pressure", "deadlinePressure"),
          ),
          avgPhysicalActivity: getAverage(latestSevenItems, (item) =>
            getNumberField(item.activity, "physical_activity_minutes", "physicalActivityMinutes"),
          ),
          avgStudyHours: getAverage(latestSevenItems, (item) =>
            getNumberField(item.activity, "study_hours", "studyHours"),
          ),
          avgSocialMediaHours: getAverage(latestSevenItems, (item) =>
            getNumberField(item.activity, "social_media_hours", "socialMediaHours"),
          ),
          stressTrend: getTrendPercentage(latestSevenItems, (item) => item.stressScore),
          sleepTrend: getTrendPercentage(latestSevenItems, (item) =>
            getNumberField(item.activity, "sleep_hours", "sleepHours"),
          ),
          taskLoadTrend: getTrendPercentage(latestSevenItems, (item) =>
            getNumberField(item.activity, "assignment_load", "assignmentLoad"),
          ),
          physicalActivityTrend: getTrendPercentage(latestSevenItems, (item) =>
            getNumberField(item.activity, "physical_activity_minutes", "physicalActivityMinutes"),
          ),
        };

        if (latestSevenItems.length > 0) {
          const startStr = latestSevenItems[latestSevenItems.length - 1].datetime || latestSevenItems[latestSevenItems.length - 1].prediction?.prediction_date;
          const endStr = latestSevenItems[0].datetime || latestSevenItems[0].prediction?.prediction_date;
          const range = formatDateRange(startStr, endStr, t.DashboardDateLocale);
          setDateRange(range);
        } else {
          setDateRange("");
        }
      }

      const chartData = [...latestSevenItems].reverse().map((item) => {
        const itemDate = item.prediction?.prediction_date || item.datetime;
        const date = new Date(itemDate);

        return {
          day: date.toLocaleDateString(t.DashboardDateLocale, {
            day: "numeric",
            month: "short",
          }),
          value: item.stressScore,
          hasData: true,
        };
      });

      const intensityCounts = latestSevenItems.reduce(
        (counts, item) => {
          if (item.stressScore >= 70) {
            counts.high += 1;
          } else if (item.stressScore >= 40) {
            counts.medium += 1;
          } else {
            counts.low += 1;
          }

          return counts;
        },
        { high: 0, medium: 0, low: 0 },
      );
      const totalIntensity = latestSevenItems.length || 1;

      let latestDatabaseInsight = null;
      let databaseRecommendations = [];

      latestDatabaseInsight = await fetchLatestDatabaseInsight();
      databaseRecommendations = await fetchLatestDatabaseRecommendations();

      setInsightData({ latestActivity, weeklySummary, dataCount: latestSevenItems.length });
      setNarrativeInsight(latestDatabaseInsight);
      setWeeklyActivityData(chartData);
      setStressIntensityData([
        { name: t.HighText, value: Math.round((intensityCounts.high / totalIntensity) * 100) },
        { name: t.MediumText, value: Math.round((intensityCounts.medium / totalIntensity) * 100) },
        { name: t.LowText, value: Math.round((intensityCounts.low / totalIntensity) * 100) },
      ]);
      setAcademicConditionData([
        {
          label: t.InsightsStudyTimeLabel,
          value: `${weeklySummary.avgStudyHours.toFixed(1)} ${t.HourText}`,
          width: `${Math.min((weeklySummary.avgStudyHours / 8) * 100, 100)}%`,
          color: "bg-blue-300",
        },
        {
          label: t.InsightsTaskLoadLabel,
          value: `${weeklySummary.avgAssignmentLoad.toFixed(0)}%`,
          width: `${Math.min(weeklySummary.avgAssignmentLoad, 100)}%`,
          color: weeklySummary.avgAssignmentLoad >= 70 ? "bg-red-300" : weeklySummary.avgAssignmentLoad >= 40 ? "bg-yellow-300" : "bg-green-400",
        },
        {
          label: t.InsightsDeadlinePressureLabel,
          value: `${weeklySummary.avgDeadlinePressure.toFixed(0)}%`,
          width: `${Math.min(weeklySummary.avgDeadlinePressure, 100)}%`,
          color: weeklySummary.avgDeadlinePressure >= 70 ? "bg-red-300" : weeklySummary.avgDeadlinePressure >= 40 ? "bg-yellow-300" : "bg-green-400",
        },
        {
          label: t.InsightsPhysicalActivityLabel,
          value: `${weeklySummary.avgPhysicalActivity.toFixed(0)} ${t.MinuteText}`,
          width: `${Math.min((weeklySummary.avgPhysicalActivity / 60) * 100, 100)}%`,
          color: weeklySummary.avgPhysicalActivity >= 30 ? "bg-green-400" : weeklySummary.avgPhysicalActivity >= 15 ? "bg-yellow-300" : "bg-red-300",
        },
        {
          label: t.InsightsAverageSleepLabel,
          value: `${weeklySummary.avgSleepHours.toFixed(1)} ${t.HourText}`,
          width: `${Math.min((weeklySummary.avgSleepHours / 8) * 100, 100)}%`,
          color: weeklySummary.avgSleepHours >= 7 ? "bg-green-400" : weeklySummary.avgSleepHours >= 5 ? "bg-yellow-300" : "bg-red-300",
        },
      ]);
      setTodayRecommendations(databaseRecommendations);

    } catch (err) {
      console.error("Failed to fetch insights data:", err);
      setError(err.response?.data?.message || err.message || t.InsightsFetchError);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    let active = true;
    const execute = async () => {
      await Promise.resolve();
      if (active) {
        fetchInsightsData();
      }
    };
    execute();
    return () => {
      active = false;
    };
  }, [fetchInsightsData]);


  // Helper to determine color based on score/level
  const getScoreColor = (score, type = 'stress') => {
    if (type === 'stress') {
      if (score >= 70) return "text-red-400";
      if (score >= 40) return "text-orange-400";
      return "text-emerald-400";
    }
    if (type === 'sleep') {
      if (score >= 7) return "text-emerald-400"; // Good sleep
      if (score >= 5) return "text-orange-400"; // Moderate sleep
      return "text-red-400"; // Low sleep
    }
    if (type === 'activity') {
      if (score >= 45) return "text-emerald-400"; // Good activity (e.g., 45 mins)
      if (score >= 20) return "text-orange-400";
      return "text-red-400";
    }
    if (type === 'load') { // For assignment load, higher is worse
      if (score >= 70) return "text-red-400";
      if (score >= 40) return "text-orange-400";
      return "text-emerald-400";
    }
    return "text-gray-400";
  };

  // Helper to determine trend indicator
  const getTrendIndicator = useCallback((trendValue) => {
    if (trendValue > 0) return t.InsightsTrendUp;
    if (trendValue < 0) return t.InsightsTrendDown;
    return t.InsightsTrendStable;
  }, [t]);

  // Map dashboardData to metricsData for StatsCard
  const metricsData = useMemo(() => {
    if (!insightData) return [];

    const latestActivity = insightData.latestActivity;
    const weeklySummary = insightData.weeklySummary;
    const latestStressScore = getNumberField(latestActivity, "stress_score", "stressScore");

    return [
      {
        title: t.StressScoreTitle,
        value: weeklySummary.avgStressScore,
        maxScore: 100,
        color: getScoreColor(weeklySummary.avgStressScore, 'stress'),
        subtitle: t.AverageText,
        trend: weeklySummary.stressTrend,
      },
      {
        title: t.LastNightSleepTitle,
        value: Number(weeklySummary.avgSleepHours.toFixed(1)),
        maxScore: 10,
        color: getScoreColor(weeklySummary.avgSleepHours, 'sleep'),
        subtitle: `${weeklySummary.avgSleepHours.toFixed(1)} ${t.HourText} ${getTrendIndicator(weeklySummary.sleepTrend)}`,
        trend: weeklySummary.sleepTrend,
      },
      {
        title: t.TaskLoadTitle,
        value: Math.round(weeklySummary.avgAssignmentLoad),
        maxScore: 100,
        color: getScoreColor(weeklySummary.avgAssignmentLoad, 'load'),
        subtitle: `${weeklySummary.avgAssignmentLoad.toFixed(0)}% ${getTrendIndicator(weeklySummary.taskLoadTrend)}`,
        trend: weeklySummary.taskLoadTrend,
      },
      {
        title: t.PhysicalActivityTitle,
        value: Math.round(weeklySummary.avgPhysicalActivity),
        maxScore: 60,
        color: getScoreColor(weeklySummary.avgPhysicalActivity, 'activity'),
        subtitle: `${weeklySummary.avgPhysicalActivity.toFixed(0)} ${t.MinuteText} ${getTrendIndicator(weeklySummary.physicalActivityTrend)}`,
        trend: weeklySummary.physicalActivityTrend,
      },
    ];
  }, [getTrendIndicator, insightData, t]);

  if (loading) {
    return (
      <Layout title={t.InsightsPageTitle} name={user.fullname} role={user.role}>
        <div className="text-center py-10 theme-muted">{t.InsightsLoading}</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={t.InsightsPageTitle} name={user.fullname} role={user.role}>
        <div className="text-center py-10 text-red-500">Error: {error}</div>
      </Layout>
    );
  }

  const latestInsightDescription = narrativeInsight?.insight_text || "data belum ada";
  const narrativeSubtitle = narrativeInsight?.created_at
    ? `${t.InsightsLatestFromDatabase} - ${new Date(narrativeInsight.created_at).toLocaleDateString(t.DashboardDateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`
    : "data belum ada";

  return (
    <Layout title={t.InsightsPageTitle} name={user.fullname} role={user.role}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="theme-subtle text-xs uppercase mb-2">
              {t.InsightsEyebrow}
            </p>
            <h1 className="theme-text text-3xl md:text-4xl font-bold">
              {t.InsightsHeroTitle}
            </h1>
          </div>
          {dateRange && (
            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm font-semibold self-start md:self-auto">
              {dateRange}
            </div>
          )}
        </div>

        {/* Section 1: Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsData.map((metric, index) => (
            <StatsCard
              key={index}
              title={metric.title}
              value={metric.value}
              maxScore={metric.maxScore}
              color={metric.color}
              subtitle={metric.subtitle}
              trend={metric.trend}
            />
          ))}
        </div>

        {/* Section 2: AI Narrative Insight */}
        <AINarrativeCard
          title={t.AINarrativeInsightTitle}
          subtitle={narrativeSubtitle}
          description={latestInsightDescription}
        />

        {/* Section 3: Academic Condition Metrics */}
        <AcademicCondition items={academicConditionData} title={t.InsightsAcademicAverageTitle} />

        {/* Section 4: Weekly Analytics */}
        <div className="grid lg:grid-cols-2 gap-6">
          <WeeklyActivityChart data={weeklyActivityData} title={t.InsightsWeeklyActivityTitle} />
          <StressIntensityChart
            avgScore={insightData?.weeklySummary.avgStressScore || 0}
            data={stressIntensityData}
            title={t.InsightsStressIntensityTitle}
          />
        </div>

        {/* Section 5: Prioritas Hari Ini */}
        <div>
          <h2 className="theme-text text-2xl font-bold mb-4">
            {t.PriorityTodayTitle}
          </h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {todayRecommendations.length > 0 ? (
              todayRecommendations.map((task, index) => (
                <PriorityCard
                  key={index}
                  title={task.title}
                  description={task.recommendation_text}
                  level={task.priority_level}
                  duration=""
                  stressImpact={task.category ? task.category.charAt(0).toUpperCase() + task.category.slice(1) : ""}
                />
              ))
            ) : (
              <div className="col-span-full theme-muted">{t.InsightsNoPriorityToday}</div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default InsightPage;

