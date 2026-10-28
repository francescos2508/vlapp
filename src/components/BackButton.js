import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the button on Login and Welcome pages
  const hideOnPaths = ["/login", '/'];
  if (hideOnPaths.includes(location.pathname)) return null;

  const goBack = function () {
    if (location.pathname === '/vlapp') navigate('login'); else navigate(-1);
  }
  return (
    <button
      onClick={goBack}
      className="back-button"
    >
      <FontAwesomeIcon icon="angle-left" />
      {/* <FontAwesomeIcon icon="angle-left" /> */}
    </button>
  );
}

export default BackButton;
