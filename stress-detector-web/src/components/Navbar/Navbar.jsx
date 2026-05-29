import PropTypes, { bool, func } from "prop-types";
import Buttons from "./Buttons";
import FotoProfile from "./FotoProfile";
import NameDisplay from "./NameDisplay";

function Navbar({ title, name, role, profilePhoto, isOpen, setIsOpen}) {
  return (
    <header
      className="
        fixed
        top-0
        right-0
        left-0 md:left-52
        z-30

        flex h-15 items-center justify-between

        border-b border-white/5
        bg-[#141414]/95
        backdrop-blur

        px-4 md:px-6 lg:px-12
        text-white
      "
    >
    {/* LEFT */}
    <div className="flex items-center gap-4">
      
      {/* Hamburger */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="
              flex h-11 w-11 items-center justify-center
              rounded-xl
              border border-white/5
              bg-white/(0.03)

              text-white/80
              backdrop-blur-sm

              transition-all duration-200

              hover:bg-white/(0.06)
              hover:text-white

              active:scale-95

              md:hidden
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}


      <h1
        className="
          text-sm font-medium tracking-tight
          sm:text-xl
          lg:text-2xl
        "
      >
        {title}
      </h1>
    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-3 md:gap-5">
      <Buttons />

      <div className="hidden h-12 w-px bg-white/10 md:block" />

      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <NameDisplay name={name} role={role} />
        </div>

        <FotoProfile src={profilePhoto} name={name} />
      </div>
    </div>
  </header>
  );
}

Navbar.propTypes = {
  title: PropTypes.string,
  name: PropTypes.string,
  role: PropTypes.string,
  profilePhoto: PropTypes.string,
  isOpen: PropTypes,bool,
  setIsOpen: PropTypes,func,
};

export default Navbar;
