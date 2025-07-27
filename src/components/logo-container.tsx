import { Link } from "react-router-dom";

export const LogoContainer = () => {
  return (
    <Link to={"/"}>
      <img
        src="/assets/img/logo/logo.png"
        alt=""
        className="h-12 w-12 rounded-full hover:scale-105 transition-all duration-200 ease-in-out"
      />
    </Link>
  );
};
