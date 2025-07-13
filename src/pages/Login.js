import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const LOGO_URL = process.env.PUBLIC_URL + "/assets/Prime_Gym.jpg";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "password") {
      setErrorMsg("");
      onLogin();
      navigate("/dashboard");
    } else {
      setErrorMsg('Usuario o contraseña incorrectos. Usa "admin" y "password"');
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <img src={LOGO_URL} alt="Logo Prime Gym" className="login-logo" />
        <h1 className="login-title">Bienvenido a Prime Gym</h1>
        <div className="login-subtitle">
          Accede a la plataforma de administración
        </div>
        {errorMsg && <div className="login-error">{errorMsg}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="login-label">Usuario o Correo Electrónico</label>
            <input
              className="login-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario o email"
              autoComplete="username"
              autoCapitalize="none"
            />
          </div>
          <div className="form-group">
            <label className="login-label">Contraseña</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </div>
          <button className="login-btn" type="submit">
            Iniciar Sesión
          </button>
          <button
            type="button"
            className="forgot-password-link"
            onClick={() => navigate("/forgot-password")}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>
        <div className="login-footer">© 2025 DAT Solutions - Prime Gym</div>
      </div>
    </div>
  );
};

export default Login;