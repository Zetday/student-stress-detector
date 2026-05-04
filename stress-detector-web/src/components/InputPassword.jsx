import React from "react";
import PropTypes from "prop-types";
import { useLanguage } from "../contexts/LanguageContext";

function InputPassword({ password, onChange, children }) {
  const { t } = useLanguage();

  return (
    <div>
      <label className="text-xs text-gray-500">{children}</label>
      <input
        type="password"
        placeholder="*******"
         className="
          w-full mt-1 px-4 py-3 rounded-xl 
          bg-gray-200 border border-gray-200 
          
          text-sm text-black
          placeholder:text-sm placeholder:text-gray-400
          
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={password}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

InputPassword.propTypes = {
  password: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default InputPassword;