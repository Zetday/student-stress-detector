import { useEffect, useState } from "react";
import Layout from "../../layouts/Layout";
import { createActivity, getActivities } from "../services/activityService";

const initialForm = {
  activityDate: new Date().toISOString().slice(0, 10),
  sleepHours: "7",
  studyHours: "4",
  screenTimeHours: "6",
  socialMediaHours: "2",
  physicalActivityMinutes: "30",
  caffeineIntakeMg: "80",
  moodScore: "7",
  fatigueLevel: "4",
  assignmentLoad: "3",
  deadlinePressure: "5",
  socialInteractionScore: "7",
  financialWorryScore: "3",
  healthConditionScore: "8",
};

const numberFields = [
  "sleepHours",
  "studyHours",
  "screenTimeHours",
  "socialMediaHours",
  "physicalActivityMinutes",
  "caffeineIntakeMg",
  "moodScore",
  "fatigueLevel",
  "assignmentLoad",
  "deadlinePressure",
  "socialInteractionScore",
  "financialWorryScore",
  "healthConditionScore",
];

const fields = [
  { name: "activityDate", label: "Tanggal", type: "date" },
  { name: "sleepHours", label: "Jam tidur", step: "0.1", suffix: "jam" },
  { name: "studyHours", label: "Jam belajar", step: "0.1", suffix: "jam" },
  { name: "screenTimeHours", label: "Screen time", step: "0.1", suffix: "jam" },
  { name: "socialMediaHours", label: "Media sosial", step: "0.1", suffix: "jam" },
  { name: "physicalActivityMinutes", label: "Aktivitas fisik", suffix: "menit" },
  { name: "caffeineIntakeMg", label: "Kafein", suffix: "mg" },
  { name: "moodScore", label: "Mood", min: "1", max: "10", suffix: "1-10" },
  { name: "fatigueLevel", label: "Kelelahan", min: "1", max: "10", suffix: "1-10" },
  { name: "assignmentLoad", label: "Jumlah tugas", min: "0", suffix: "tugas" },
  { name: "deadlinePressure", label: "Tekanan deadline", min: "1", max: "10", suffix: "1-10" },
  { name: "socialInteractionScore", label: "Interaksi sosial", min: "1", max: "10", suffix: "1-10" },
  { name: "financialWorryScore", label: "Khawatir finansial", min: "1", max: "10", suffix: "1-10" },
  { name: "healthConditionScore", label: "Kondisi kesehatan", min: "1", max: "10", suffix: "1-10" },
];

function ActivitiesPage() {
  const [form, setForm] = useState(initialForm);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadActivities({ showLoading = true } = {}) {
    if (showLoading) {
      setIsLoading(true);
    }

    setError("");

    const { error: hasError, data, message: responseMessage } = await getActivities();

    if (hasError) {
      setError(responseMessage);
      setIsLoading(false);
      return;
    }

    setActivities(data?.activities || []);
    setIsLoading(false);
  }

  useEffect(() => {
    let ignore = false;

    async function fetchInitialActivities() {
      const { error: hasError, data, message: responseMessage } = await getActivities();

      if (ignore) {
        return;
      }

      if (hasError) {
        setError(responseMessage);
        setIsLoading(false);
        return;
      }

      setActivities(data?.activities || []);
      setIsLoading(false);
    }

    fetchInitialActivities();

    return () => {
      ignore = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setError("");
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const payload = {
      ...form,
      ...Object.fromEntries(
        numberFields.map((fieldName) => [fieldName, Number(form[fieldName])]),
      ),
    };

    const { error: hasError, message: responseMessage } =
      await createActivity(payload);

    if (hasError) {
      setError(responseMessage);
      setIsSubmitting(false);
      return;
    }

    setMessage(responseMessage || "Aktivitas berhasil dikirim.");
    setForm((currentForm) => ({
      ...initialForm,
      activityDate: currentForm.activityDate,
    }));
    setIsSubmitting(false);
    loadActivities({ showLoading: false });
  }

  return (
    <Layout title="Aktivitas" name="User" role="User">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section className="rounded-lg border border-white/5 bg-[#141414] p-5 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Aktivitas Harian</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Isi data harianmu, lalu backend akan menyimpan aktivitas dan memicu prediksi stres.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field.name} className="grid gap-2 text-sm text-zinc-300">
                <span>{field.label}</span>
                <div className="flex overflow-hidden rounded-lg border border-white/10 bg-[#0F0F0F] focus-within:border-blue-400">
                  <input
                    name={field.name}
                    type={field.type || "number"}
                    min={field.min ?? "0"}
                    max={field.max}
                    step={field.step || "1"}
                    value={form[field.name]}
                    onChange={handleChange}
                    required
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-white outline-none"
                  />
                  {field.suffix && (
                    <span className="flex min-w-16 items-center justify-center border-l border-white/10 px-3 text-xs text-zinc-500">
                      {field.suffix}
                    </span>
                  )}
                </div>
              </label>
            ))}

            <div className="md:col-span-2">
              {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
              {message && <p className="mb-3 text-sm text-emerald-400">{message}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-lg bg-blue-500 px-4 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                {isSubmitting ? "Mengirim..." : "Kirim aktivitas"}
              </button>
            </div>
          </form>
        </section>

        <aside className="rounded-lg border border-white/5 bg-[#141414] p-5 md:p-6">
          <h2 className="text-xl font-semibold text-white">Riwayat terbaru</h2>

          <div className="mt-5 space-y-3">
            {isLoading && <p className="text-sm text-zinc-400">Memuat aktivitas...</p>}

            {!isLoading && activities.length === 0 && (
              <p className="text-sm text-zinc-400">Belum ada aktivitas yang tersimpan.</p>
            )}

            {!isLoading &&
              activities.map((activity) => (
                <article
                  key={activity.id}
                  className="rounded-lg border border-white/5 bg-[#101010] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">
                        {new Date(activity.activity_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        Tidur {activity.sleep_hours} jam, belajar {activity.study_hours} jam
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                      Mood {activity.mood_score}/10
                    </span>
                  </div>
                </article>
              ))}
          </div>
        </aside>
      </div>
    </Layout>
  );
}

export default ActivitiesPage;
