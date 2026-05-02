export default function LeftPanel() {
  return (
    <div className="relative flex flex-col justify-between 
    bg-gradient-to-br from-gray-900 via-gray-950 to-black 
    text-white p-8 md:p-12 
    w-full md:w-1/2 
    min-h-[300px] md:min-h-full">

      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent pointer-events-none" />

      {/* 🔹 Content */}
      <div className="relative z-10">

        {/* Logo */}
        <h1 className="text-sm tracking-widest text-gray-400 mb-6">
          <img src="" alt="" />
        </h1>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-semibold leading-snug mb-4">
          Ubah Tekanan Menjadi Presisi.
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md">
          Optimalkan kesehatan mental Anda dengan teknologi analisis biometrik tercanggih untuk performa yang lebih tenang dan terukur.
        </p>

        {/* Features */}
        <div className="space-y-4">
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center 
              rounded-lg bg-blue-500/10 border border-blue-500/20">
              📊
            </div>
            <div>
              <p className="text-sm font-medium">Data Real-time</p>
              <p className="text-xs text-gray-500">
                Pantau kondisi Anda secara langsung
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center 
              rounded-lg bg-green-500/10 border border-green-500/20">
              🔒
            </div>
            <div>
              <p className="text-sm font-medium">Privasi Terjamin</p>
              <p className="text-xs text-gray-500">
                Data Anda aman dan terenkripsi
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 🔹 Footer */}
      <p className="relative z-10 text-xs text-gray-600 mt-10">
        © 2026 STRESSLENS
      </p>
    </div>
  );
}