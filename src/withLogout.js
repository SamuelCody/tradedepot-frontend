// withLogout.js
import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const withLogout = (WrappedComponent) => {
  return (props) => {
    let navigate = useNavigate();

    const handleLogout = () => {
      localStorage.removeItem("token"); // Remove the token from storage
      navigate("/login"); // Redirect to the login page
    };

    return (
      <>
        <Button
          onClick={handleLogout}
          style={{ position: "absolute", top: "10px", right: "10px" }}
        >
          Logout
        </Button>
        <WrappedComponent {...props} />
      </>
    );
  };
};

export default withLogout;
