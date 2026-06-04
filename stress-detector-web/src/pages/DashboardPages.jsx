import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../layouts/Layout";
import Datas from "../components/DiagnosticBox/Datas";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "../contexts/UserContext";
import StressChart from "../components/StresChart/StressChart";
import calender from  "../assets/icons/calendar.svg"
import TodayDiagnose from "../components/DiagnosticBox/TodayDiagnose";
// import staricon from "../assets/icons/star.png" // Tidak digunakan
import api from "../services/api"; // Import service API
import { getActivityHistory } from "../services/activityService";

const parseDateOnly = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const [year, month, day] = String(dateValue).slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const getLocalDateKey = (date) => {
  const parsedDate = date instanceof Date ? date : parseDateOnly(date) || new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDays = (date, amount) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const getActivityDateKey = (item) =>
  getLocalDateKey(
    item?.prediction?.prediction_date ||
    item?.activity?.activity_date ||
    item?.datetime,
  );

const getNumberField = (data, snakeCaseName, camelCaseName) => {
  const value = data?.[snakeCaseName] ?? data?.[camelCaseName];
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
};

const mergeHistoryItem = (item) => {
  if (!item) {
    return null;
  }

  return {
    ...item.activity,
    ...item.prediction,
    id: item.id,
    activity_date: item.prediction?.prediction_date || item.activity?.activity_date,
    activity_status: item.activity?.activity_status,
    status: item.status,
    stress_score: item.stressScore,
    stressScore: item.stressScore,
  };
};

function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useUser();
  const { activityId: paramActivityId } = useParams(); // Ambil activityId dari URL jika ada
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [draftActivity, setDraftActivity] = useState(null);
  const [stressTrendData, setStressTrendData] = useState([]);

  const currentDate = new Date();
  const formatActivityDate = (dateString) => {
    if (!dateString) return "";
    const date = parseDateOnly(dateString) || new Date(dateString);
    return date.toLocaleDateString(t.DashboardDateLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format tanggal hari ini untuk greeting default
  const todayFormattedDate = currentDate.toLocaleDateString(t.DashboardDateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const historyResponse = await getActivityHistory();

        if (historyResponse.error) {
          throw new Error(historyResponse.message);
        }

        const history = historyResponse.data || [];
        const startDate = addDays(today, -6);
        const startDateKey = getLocalDateKey(startDate);
        const todayDateKey = getLocalDateKey(today);
        const sortedHistory = [...history].sort((a, b) => b.datetime - a.datetime);
        const sevenDayItems = sortedHistory.filter((item) => {
          const activityDateKey = getActivityDateKey(item);
          return (
            activityDateKey &&
            activityDateKey >= startDateKey &&
            activityDateKey <= todayDateKey
          );
        });

        setDraftActivity(sevenDayItems.find((item) => item.status === "Draft") || null);

        const rolling7Days = sortedHistory
          .filter((item) => item.status !== "Draft")
          .slice(0, 7)
          .reverse()
          .map((item) => {
            const itemDate = item.prediction?.prediction_date || item.datetime;
            const date = parseDateOnly(itemDate) || new Date(itemDate);

            return {
              label: date.toLocaleDateString(t.DashboardDateLocale, {
                day: "numeric",
                month: "short",
              }),
              stress_score: item.stressScore,
              hasStressData: true,
              prediction_date: getLocalDateKey(itemDate),
            };
          });

        setStressTrendData(rolling7Days);

        // 1. Ambil aktivitas spesifik jika paramActivityId ada, jika tidak ambil data selesai terbaru.
        let activityToDisplay = null;
        if (paramActivityId) {
          const selectedHistoryItem = sortedHistory.find(
            (item) => String(item.id) === String(paramActivityId),
          );

          if (selectedHistoryItem) {
            activityToDisplay = mergeHistoryItem(selectedHistoryItem);
          } else {
            const response = await api.get(`/activities/${paramActivityId}`);
            const rawData = response.data.data;
            // Jika data dibungkus dalam properti 'activity', gabungkan dengan 'prediction'
            activityToDisplay = rawData.activity 
              ? { ...rawData.activity, ...rawData.prediction } 
              : rawData;
          }
        } else {
          const latestCompletedItem = sortedHistory.find((item) => item.status !== "Draft");
          activityToDisplay = mergeHistoryItem(latestCompletedItem);
        }
        setCurrentActivity(activityToDisplay);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.response?.data?.message || err.message || "Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [paramActivityId, user.fullname, t.DashboardDateLocale]); // Tambahkan t.DashboardDateLocale ke dependencies

  const handleViewDraftDetail = () => {
    navigate("/activity-history?status=draft");
  };

  const currentActivityFormattedDate = currentActivity ? formatActivityDate(currentActivity.activity_date) : "";

  if (loading) {
    return (
      <Layout title="Dashboard" name={user.fullname} role={user.role}>
        <div className="text-center py-10 theme-muted">Memuat data dashboard...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard" name={user.fullname} role={user.role}>
        <div className="text-center py-10 text-red-500">Error: {error}</div>
      </Layout>
    );
  }

  return (
  <Layout title="Dashboard" name={user.fullname} role={user.role}>
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

    {/* Greeting */}
    <div className="col-span-1 lg:col-span-4">
      <h1 className="theme-text text-2xl md:text-4xl font-bold">
        {t.DashboardGreeting} {user.fullname || "User"}
      </h1>

    {/* Date Display: Menampilkan tanggal hari ini, atau tanggal aktivitas jika sedang melihat detail */}
      <p className="theme-muted mt-1 text-sm md:text-sm">
        {paramActivityId && currentActivity ? currentActivityFormattedDate : todayFormattedDate}
      </p>
    </div>

    {/* Cards */}
      <div className="col-span-1 lg:col-span-4">
        <div className="theme-card rounded-2xl p-5 border">
          <div className="flex items-center gap-4">
            
            {/* Icon */}
            <div className="flex-shrink-0">
              <img
                src={calender}
                alt="calendar"
                className="w-8 h-8 dark:invert"
              />
            </div>

            {/* Text */}
            <div>
              <h2 className="theme-text text-sm md:text-lg font-bold">
                {t.LastJournalSummaryTitle}
              </h2>

              <p className="theme-muted text-sm mt-1">
                {currentActivityFormattedDate || "Belum ada aktivitas tercatat"}
              </p>
            </div>

          </div>
        </div>
      </div>

    {/* Lengkapi catatan */}
    {draftActivity && (
      <div className="col-span-1 lg:col-span-4">
        <div className="theme-card border border-orange-500/40 rounded-xl px-6 py-5">
          <div className="flex items-center justify-between">
            
            {/* Left Content */}
            <div className="flex items-center gap-4">
              
              {/* Icon Box */}
              <div className="w-10 h-10 rounded-md bg-orange-400 flex items-center justify-center">
                <img
                  src={calender}
                  alt="calendar"
                  className="w-5 h-5 opacity-80"
                />
              </div>

              {/* Text */}
              <div>
                <h2 className="text-orange-400 font-semibold text-lg">
                  Catatan Aktivitas Belum Lengkap
                </h2>

                <p className="theme-muted text-sm mt-1">
                  Lengkapi catatan aktivitas agar data diperbarui.
                </p>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleViewDraftDetail}
              className="
                bg-orange-400
                hover:bg-orange-500
                text-black
                font-medium
                px-6
                py-3
                rounded-md
                transition-colors
              "
            >
              Lihat Detail
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Data Cards */}
      <Datas
        metric="Mood"
        title={t.MoodScoreTitle}
        value={getNumberField(currentActivity, "mood_score", "moodScore").toString()}
      />
      <Datas
        metric="Fatigue"
        title={t.FatigueLevelTitle}
        value={getNumberField(currentActivity, "fatigue_level", "fatigueLevel").toString()}
      />
      <Datas
        metric="SocialMedia"
        title={t.SocialMediaTitle}
        value={getNumberField(currentActivity, "social_media_hours", "socialMediaHours").toString()}
      />
      <Datas
        metric="Stress"
        title={t.StressScoreTitle}
        value={getNumberField(currentActivity, "stress_score", "stressScore").toString()}
      />


    {/* Chart */}
    <div className="col-span-1 lg:col-span-3">
      <StressChart data={stressTrendData} />
    </div>

    {/* Side Panel */}
    <div className="theme-card rounded-2xl p-5 md:p-6">
      <h2 className="theme-text text-lg md:text-sm font-semibold mb-6">
        Kondisi
      </h2>

      <TodayDiagnose
        studyTime={getNumberField(currentActivity, "study_hours", "studyHours")}
        taskLoad={getNumberField(currentActivity, "assignment_load", "assignmentLoad")}
        deadlinePressure={getNumberField(currentActivity, "deadline_pressure", "deadlinePressure")}
        physicalActivity={getNumberField(currentActivity, "physical_activity_minutes", "physicalActivityMinutes")}
        sleep={getNumberField(currentActivity, "sleep_hours", "sleepHours")}
      />
    </div>

    <div className="col-span-1 lg:col-span-4">
      <div className="theme-card-muted rounded-2xl border p-5">
        <div className="mb-4">
          <p className="theme-text text-lg font-semibold">{t.ActivityDailyNoteTitle || "Catatan Harian"}</p>
          <p className="theme-muted mt-2 text-sm leading-relaxed">
            Riwayat catatan dari jurnal aktivitas terakhir.
          </p>
        </div>

        <textarea
          readOnly
          value={currentActivity?.note || ""}
          placeholder="Belum ada catatan aktivitas."
          className="theme-input min-h-45 w-full resize-none rounded-2xl border p-4 text-sm outline-none"
        />

        <div className="theme-subtle mt-3 text-right text-xs">
          {(currentActivity?.note || "").length}/1000
        </div>
      </div>
    </div>

  </div>
</Layout>
  );
}

export default DashboardPage;
