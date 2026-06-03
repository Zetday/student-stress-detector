import Layout from "../../layouts/Layout";
import Datas from "../components/DiagnosticBox/Datas";
import { useLanguage } from "../contexts/LanguageContext";
import StressChart from "../components/StresChart/StressChart";
import calender from  "../assets/icons/calendar.svg"
import TodayDiagnose from "../components/DiagnosticBox/TodayDiagnose";
import staricon from "../assets/icons/star.png"

function DashboardPage() {
  const { t } = useLanguage();

  const sekarang = new Date();
  const formatTanggal = sekarang.toLocaleDateString(t.DashboardDateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });


  return (
  <Layout title="Dashboard" name="User" role="User">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

    {/* Greeting */}
    <div className="col-span-1 lg:col-span-4">
      <h1 className="text-2xl md:text-4xl font-bold text-white">
        {t.DashboardGreeting} Aryanda
      </h1>

    {/* Today Date */}
      <p className="text-zinc-400 mt-1 text-sm md:text-sm">
        {formatTanggal}
      </p>
    </div>

    {/* Cards */}
      <div className="col-span-1 lg:col-span-4">
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <div className="flex items-center gap-4">
            
            {/* Icon */}
            <div className="flex-shrink-0">
              <img
                src={calender}
                alt="calendar"
                className="w-8 h-8 invert"
              />
            </div>

            {/* Text */}
            <div>
              <h2 className="text-sm md:text-lg font-bold text-zinc-200">
                {t.LastJournalSummaryTitle}
              </h2>

              <p className="text-zinc-400 text-sm mt-1">
                Jumat, 17 April 2026
              </p>
            </div>

          </div>
        </div>
      </div>

    {/* Lengkapi catatan */}
    <div className="col-span-1 lg:col-span-4">
      <div className="bg-zinc-900 border border-orange-500/40 rounded-xl px-6 py-5">
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
                Catatan Kemarin Belum Lengkap
              </h2>

              <p className="text-zinc-500 text-sm mt-1">
                Lengkapi catatan aktivitas agar data diperbarui.
              </p>
            </div>
          </div>

          {/* Button */}
          <button
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

      <Datas
        metric="Mood"
        title={t.MoodScoreTitle}
        value="65"
      />
      <Datas
        metric="Fatigue"
        title={t.FatigueLevelTitle}
        value="60"
      />
      <Datas
        metric="SocialMedia"
        title={t.SocialMediaTitle}
        value="2"
      />
      <Datas
        metric="Stress"
        title={t.StressScoreTitle}
        value="72"
      />


    {/* Chart */}
    <div className="col-span-1 lg:col-span-3">

      <div className="col-span-1 lg:col-span-3">
        <StressChart />
      </div>

    </div>

    {/* Side Panel */}
    <div className="bg-zinc-800 rounded-2xl p-5 md:p-6">
      <h2 className="text-lg md:text-sm font-semibold text-white mb-6">
        Kondisi hari ini
      </h2>

      <TodayDiagnose
        studyTime={6.5}
        taskLoad="High"
        deadlinePressure={90}
        physicalActivity={45}
        sleep={5.5}
      />
    </div>

  </div>
</Layout>
  );
}

export default DashboardPage;