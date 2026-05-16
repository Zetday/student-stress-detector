// Sistem
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useInput from "../../hooks/useInput";
import { useLanguage } from "../contexts/LanguageContext";

// Asset
import logo from "../assets/img/logo.png";
import google from "../assets/img/google-color-svgrepo-com.svg"

// Komponent
import ButtonSubmit from "../components/ButtonSubmit";
import InputEmail from "../components/InputEmail";
import InputName from "../components/InputName";
import InputPassword from "../components/InputPassword";
import { register } from "../services/authService";

// layouts
import LeftPanel from "../../layouts/LeftPanel";

function RegisterPage() {
  const [name, onNameChange] = useInput("");
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  const [confirmPassword, onConfirmPasswordChange] = useInput("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiError, setApiError] = useState("");

  const { t } = useLanguage();
  const navigate = useNavigate();

  function validatePassword(value) {
    if (value.length < 8) {
      return "Password minimal harus 8 karakter.";
    }

    if (!/\d/.test(value)) {
      return "Password harus memiliki minimal 1 angka.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(value)) {
      return "Password harus memiliki minimal 1 karakter khusus.";
    }

    return "";
  }

  function handlePasswordChange(e) {
    onPasswordChange(e);
    setApiError("");
    setPasswordError("");
    setConfirmPasswordError("");
  }

  function handleConfirmPasswordChange(e) {
    onConfirmPasswordChange(e);
    setApiError("");
    setConfirmPasswordError("");
  }

  function handleEmailChange(e) {
    onEmailChange(e);
    setApiError("");
    setEmailError("");
  }

  async function onSubmitHandler(e) {
    e.preventDefault();
    setApiError("");
    setEmailError("");

    const validationMessage = validatePassword(password);

    if (validationMessage) {
      setPasswordError(validationMessage);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Password dan konfirmasi password tidak cocok!");
      return;
    }

    const { error, message } = await register({ name, email, password });

    if (error) {
      if (message.toLowerCase().includes("email")) {
        setEmailError(message);
      } else {
        setApiError(message);
      }

      return;
    }

    navigate("/login");

  }

  return (
    <section
      className="
        min-h-screen
        bg-[#0B0B0B]
        flex justify-center
        px-4 py-10
      "
    >
      {/* Main Card */}
      <div
        className="
          w-full max-w-6xl
          h-auto
          rounded-3xl
          overflow-hidden
          bg-[#111111]
          border border-white/5
          shadow-2xl
          grid grid-cols-1 lg:grid-cols-2
        "
      >
        {/* LEFT */}
        <div className="hidden md:block">
          <LeftPanel />
        </div>

        {/* RIGHT */}
        <div
          className="
            flex items-center justify-center
            px-8 md:px-16 py-12
            bg-[#171717]">

          <div className="w-full max-w-md">

            {/* Logo */}
            <img src={logo} alt="logo cek tenang" className="w-36 mb-6"/>

            {/* Heading */}
            <h2 className="text-4xl font-bold text-white mb-2">
              {t.Create}
            </h2>

            <p className="text-sm text-gray-400 mb-10">
              {t.Form}
            </p>

            {/* Form */}
            <form
              onSubmit={onSubmitHandler}
              className="space-y-6"
            >
              {/* Name */}
              <InputName
                value={name}
                onChange={onNameChange}
                children={t.LabelName}
                placeholder={t.InputName}
              />

              {/* Email */}
              <InputEmail
                value={email}
                onChange={handleEmailChange}
                error={emailError}
                placeholder={t.InputEmail}
                children="Email"
              />

              {/* Password Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <InputPassword
                  value={password}
                  autoComplete="new-password"
                  onChange={handlePasswordChange}
                  error={passwordError}
                  placeholder="******"> 
                  {t.LabelPassword} 
                </InputPassword>

                <InputPassword
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={handleConfirmPasswordChange}
                  error={confirmPasswordError}
                  placeholder="******">
                  {t.LabelConfirmPassword}
                </InputPassword>
              </div>

              {apiError && (
                <p className="text-sm text-red-500">
                  {apiError}
                </p>
              )}

              {/* Submit */}
              <ButtonSubmit type="submit">
                {t.SubmitRegister}
              </ButtonSubmit>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10"></div>

                <span className="text-xs tracking-[0.25em] text-gray-500">
                 {t?.or || "Atau"}
                </span>

                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              {/* Google */}
              <button
                type="button"
                className="
                  w-full
                  h-12
                  rounded-xl
                  border border-white/10
                  bg-[#141414]
                  text-white
                  text-sm
                  font-medium
                  hover:bg-[#1B1B1B]
                  transition

                  flex items-center justify-center gap-3
                "
              >
                <span>{t.Google}</span>
                <img
                  src={google}
                  alt="Google"
                  className="w-5 h-5 object-contain"
                />
              </button>

              {/* Switch */}
              <p className="text-sm text-center text-gray-500 pt-2">
                {t.LabelLogin}{" "}

                <Link
                  to="/login"
                  className="
                    text-[#9BB3FF]
                    hover:text-white
                    transition
                    font-medium
                  "
                >
                  {t.LinkLogin}
                </Link>
              </p>
            </form>

          </div>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
