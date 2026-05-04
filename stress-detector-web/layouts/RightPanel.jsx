import { useLanguage } from "../src/contexts/LanguageContext";

import InputEmail from "../src/components/InputEmail";
import InputName from "../src/components/InputName";
import InputPassword from "../src/components/InputPassword";
import ButtonSubmit from "../src/components/ButtonSubmit";

export default function RightPanel() {
  const { t } = useLanguage();
  return (
    <div className="w-full md:w-1/2 min-h-screen 
      bg-gray-100 flex items-center justify-center p-6 md:p-10">

      <div className="w-full max-w-md">

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
          Mulai Perjalanan Anda
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Lengkapi data di bawah untuk akses laboratorium data Anda.
        </p>

        {/* Form */}
        <div className="space-y-4">
          <InputName/>

          {/* Email */}
          <InputEmail/>

          {/* Password */}
          <div className="grid grid-cols-2 gap-3">
            <InputPassword>{t.LabelPassword}</InputPassword>
            <InputPassword>{t.LabelConfirmPassword}</InputPassword>
          </div>

          {/* Button */}
          <ButtonSubmit>{t.SubmitRegister}</ButtonSubmit>

          {/* Login link */}
          <p className="text-sm text-center text-gray-500">
            {t.LabelLogin}{" "}
            <span className="text-blue-600 cursor-pointer">
              {t.LinkLogin}
            </span>
          </p>

        </div>

      </div>
    </div>
  );
}