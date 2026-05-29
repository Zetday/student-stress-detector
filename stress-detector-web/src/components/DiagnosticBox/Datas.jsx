import PropTypes from "prop-types";
import { useLanguage } from "../../contexts/LanguageContext";

function Datas({ title, value, unit, text }) {
    const { t } = useLanguage();
    const getStressStatus = (score) => {
      if (score < 50) {
        return {
          label: `${t.PositiveText}`,
          color: "text-green-500",
          bgcolor: "bg-green-500",
        };
      }

      if (score < 75) {
        return {
          label: `${t.MediumText}`,
          color: "text-yellow-500",
          bgcolor: "bg-yellow-500",
        };
      }

      return {
        label: `${t.HighText}`,
        color: "text-red-500",
        bgcolor: "bg-red-500",
      };
    };

    const stress = getStressStatus(Number(value));

  return (
    <div
      className="
        bg-zinc-800 rounded-2xl p-5
        flex flex-col gap-3
        min-h-(150px)
      "
    >
      <span className="text-zinc-400 text-xs md:text-sm uppercase tracking-wide">
        {title}
      </span>

      <div className="flex items-end gap-2">
        <span className={`text-3xl md:text-5xl font-bold ${stress.color}`}>
          {value}
        </span>

        <span className={`text-sm md:text-base mb-1 ${stress.color}`}>
          {stress.label}
        </span>
      </div>

      <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden mt-auto">
        <div
          className={`h-full ${stress.bgcolor}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

Datas.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default Datas;