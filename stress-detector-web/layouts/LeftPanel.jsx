import logo from '../src/assets/img/logo.png'

export default function LeftPanel() {
  return (
    <div className="relative w-full md:w-1/2 min-h-screen 
      bg-gradient-to-br from-[#0f2a5f] via-[#081a3a] to-black 
      text-white p-8 md:p-14 flex flex-col justify-between">

      {/* Overlay glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.15),transparent_40%)]" />

      <div className="relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-40 h-40 object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Ubah Tekanan <br />
          Menjadi Presisi.
        </h1>

        {/* Desc */}
        <p className="text-gray-300 max-w-md text-sm md:text-base mb-10">
          Optimalkan kesehatan mental Anda dengan teknologi analisis biometrik 
          tercanggih untuk performa yang lebih tenang dan terukur.
        </p>

        {/* Cards */}
        <div className="space-y-4">

          {/* Card 1 */}
          <div className="bg-white/5 border border-white/10 
            rounded-xl p-5 backdrop-blur-md">
            <p className="font-medium mb-1">
              Analisis Biometrik Real-time
            </p>
            <p className="text-xs text-gray-400">
              Pantau fluktuasi kortisol dan detak jantung Anda secara instan dengan akurasi klinis.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/5 border border-white/10 
            rounded-xl p-5 backdrop-blur-md">
            <p className="font-medium mb-1">
              Laporan Klinis Mingguan
            </p>
            <p className="text-xs text-gray-400">
              Dapatkan ringkasan data mendalam yang disusun oleh algoritma medis untuk performa optimal.
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-500 mt-10 relative z-10">
        © 2024 STRESS LENS. SCIENTIFIC ATELIER PRECISION.
      </p>
    </div>
  );
}