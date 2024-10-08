import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import AuthBox from "../components/AuthBox";
import { store, useAppSelector } from "../store";
import {
  closeConnectWithServerAuth,
  connectWithSocketServerAuth,
} from "../socket/socketConnection";
import { isChrome, isFirefox, isSafari, isEdge } from "react-device-detect";
import QRCode from "qrcode.react";
import axios from "axios";

const RedirectText = styled("span")({
  color: "#00AFF4",
  fontWeight: 500,
  cursor: "pointer",
});

const Login = () => {
  const navigate = useNavigate();
  const { userDetails } = useAppSelector(
    (state) => state.auth
  );
  const [location, setLocation] = useState({});
  const getBrowser = () => {
    if (isChrome) {
      return "Google Chrome";
    } else if (isFirefox) {
      return "Mozilla Firefox";
    } else if (isSafari) {
      return "Apple Safari";
    } else if (isEdge) {
      return "Microsoft Edge";
    } else {
      return "Unknown";
    }
  };

  useEffect(() => {
    connectWithSocketServerAuth();
  }, [userDetails, navigate]);

  useEffect(() => {
    if (userDetails?.token && userDetails?.active) {
      navigate("/dashboard");
    }
  }, [userDetails, navigate]);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const response = await axios.get("https://api.ipify.org?format=json");
        if (response.data) {
          const location = await axios.get(
            `https://ipinfo.io/${response.data.ip}?token=f671b9cf273e69`
          );
          if (location) {
            setLocation({
              city: location?.data?.city,
              country: location?.data?.country,
            });
          }
        }
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    getLocation();
  }, [navigate]);

  return (
    <AuthBox>
      <Typography variant="h5" sx={{ color: "white" }}>
        Welcome Back!
      </Typography>
      <Typography sx={{ color: "#b9bbbe" }}>Happy to see you again!</Typography>
      {store.getState().auth.socketId !== "" ? (
        <div>
          <QRCode
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            value={JSON.stringify({
              socketId: store.getState().auth.socketId,
              browser: getBrowser(),
              time: new Date().toLocaleString(),
              location : location,
              key : store.getState().keyLogin.keyQr
            })}
            size={210}
          />
        </div>
      ) : null}
      <Typography
        sx={{ color: "#b9bbbe" }}
        style={{ marginTop: "10px", marginBottom: "10px" }}
      >
        Use KMATASK mobile app to scan QR code!
      </Typography>
      <Typography sx={{ color: "#72767d" }} variant="subtitle2">
        {`Don't have an account? `}
        <RedirectText
          onClick={() => {
            closeConnectWithServerAuth();
            navigate("/register");
          }}
        >
          Register here
        </RedirectText>
        <RedirectText
          onClick={() => navigate("/forgotPassword")}
          style={{ marginLeft: "40%" }}
        >
          Forgot Password
        </RedirectText>
      </Typography>
    </AuthBox>
  );
};

export default Login;
