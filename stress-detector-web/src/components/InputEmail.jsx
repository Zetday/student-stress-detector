import React from "react";
import PropTypes from "prop-types";
import { useLanguage } from "../contexts/LanguageContext";

function InputEmail({ email, onChange }) {
  const { t } = useLanguage();

  return (
    <div>
      <label className="text-xs text-gray-500">Email</label>
      <input
        type="email"
        placeholder={t.InputEmail}
         className="
          w-full mt-1 px-4 py-3 rounded-xl 
          bg-gray-200 border border-gray-200 
          
          text-sm text-black
          placeholder:text-sm placeholder:text-gray-400
          
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={email}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

InputEmail.propTypes = {
  email: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default InputEmail;