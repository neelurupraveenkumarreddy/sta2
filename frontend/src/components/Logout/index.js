import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove JWT token
    Cookies.remove("jwt_token");

    // Redirect to login page
    navigate("/");
  }, [navigate]);

  return <h2>Logging out...</h2>;
};

export default Logout;
