import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  login,
  registerWithCouple,
  registerNewCouple,
} from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import "../styles/mobile-pwa.css";

type AuthMode = "login" | "register";
type RegisterStep = 1 | 2 | 3;
type CoupleChoice = "join" | "create" | null;

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  coupleId?: string;
  coupleName?: string;
  anniversaryDate?: string;
}

export default function WelcomeMobile() {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
  const [coupleChoice, setCoupleChoice] = useState<CoupleChoice>(null);
  const [error, setError] = useState<string>("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await login({
        email: loginData.email,
        password: loginData.password,
      });
      authLogin(response);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore durante il login"
      );
    }
  };

  const handleRegisterNext = () => {
    if (registerStep === 1) {
      if (
        !registerData.name ||
        !registerData.email ||
        !registerData.password ||
        !registerData.confirmPassword
      ) {
        setError("Tutti i campi sono obbligatori");
        return;
      }
      if (registerData.password !== registerData.confirmPassword) {
        setError("Le password non coincidono");
        return;
      }
      if (registerData.password.length < 6) {
        setError("La password deve essere di almeno 6 caratteri");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerData.email)) {
        setError("Email non valida");
        return;
      }
      setRegisterStep(2);
    } else if (registerStep === 2) {
      if (!coupleChoice) {
        setError("Seleziona un'opzione");
        return;
      }
      setRegisterStep(3);
    }
    setError("");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      let response;
      if (coupleChoice === "join") {
        if (!registerData.coupleId) {
          setError("Inserisci l'ID della coppia");
          return;
        }
        response = await registerWithCouple({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          coupleId: registerData.coupleId,
        });
      } else {
        if (!registerData.coupleName || !registerData.anniversaryDate) {
          setError("Tutti i campi sono obbligatori");
          return;
        }
        response = await registerNewCouple({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          coupleName: registerData.coupleName,
          anniversaryDate: registerData.anniversaryDate,
        });
      }
      authLogin(response);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante la registrazione"
      );
    }
  };

  return (
    <div className="pwa-welcome" role="main" aria-label="Accedi o registrati">
      <div className="pwa-welcome-inner">
        <header className="pwa-welcome-header">
          <h1 className="pwa-welcome-logo">SORE</h1>
          <p className="pwa-welcome-subtitle">
            I tuoi ricordi speciali, insieme
          </p>
        </header>

        <div className="pwa-welcome-card">
          <div className="pwa-welcome-tabs">
            <button
              type="button"
              className={`pwa-welcome-tab ${
                mode === "login" ? "pwa-welcome-tab-active" : ""
              }`}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Accedi
            </button>
            <button
              type="button"
              className={`pwa-welcome-tab ${
                mode === "register" ? "pwa-welcome-tab-active" : ""
              }`}
              onClick={() => {
                setMode("register");
                setRegisterStep(1);
                setCoupleChoice(null);
                setError("");
              }}
            >
              Registrati
            </button>
          </div>

          {error && (
            <div className="pwa-welcome-error" role="alert">
              {error}
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="pwa-welcome-form">
              <div className="pwa-welcome-field">
                <label className="pwa-welcome-label">Email</label>
                <input
                  type="email"
                  className="pwa-welcome-input"
                  placeholder="La tua email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  autoComplete="email"
                />
              </div>
              <div className="pwa-welcome-field">
                <label className="pwa-welcome-label">Password</label>
                <input
                  type="password"
                  className="pwa-welcome-input"
                  placeholder="La tua password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="pwa-welcome-btn">
                Accedi
              </button>
            </form>
          )}

          {mode === "register" && (
            <div className="pwa-welcome-form">
              <div className="pwa-welcome-steps">
                <div
                  className={`pwa-welcome-step-dot ${
                    registerStep >= 1 ? "pwa-welcome-step-dot-active" : ""
                  } ${registerStep > 1 ? "pwa-welcome-step-dot-done" : ""}`}
                >
                  {registerStep > 1 ? (
                    <span className="material-symbols-outlined">check</span>
                  ) : (
                    1
                  )}
                </div>
                <div className="pwa-welcome-step-line" />
                <div
                  className={`pwa-welcome-step-dot ${
                    registerStep >= 2 ? "pwa-welcome-step-dot-active" : ""
                  } ${registerStep > 2 ? "pwa-welcome-step-dot-done" : ""}`}
                >
                  {registerStep > 2 ? (
                    <span className="material-symbols-outlined">check</span>
                  ) : (
                    2
                  )}
                </div>
                <div className="pwa-welcome-step-line" />
                <div
                  className={`pwa-welcome-step-dot ${
                    registerStep >= 3 ? "pwa-welcome-step-dot-active" : ""
                  }`}
                >
                  3
                </div>
              </div>

              {registerStep === 1 && (
                <>
                  <div className="pwa-welcome-field">
                    <label className="pwa-welcome-label">Nome</label>
                    <input
                      type="text"
                      className="pwa-welcome-input"
                      placeholder="Il tuo nome"
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="pwa-welcome-field">
                    <label className="pwa-welcome-label">Email</label>
                    <input
                      type="email"
                      className="pwa-welcome-input"
                      placeholder="La tua email"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="pwa-welcome-field">
                    <label className="pwa-welcome-label">Password</label>
                    <input
                      type="password"
                      className="pwa-welcome-input"
                      placeholder="Minimo 6 caratteri"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="pwa-welcome-field">
                    <label className="pwa-welcome-label">
                      Conferma password
                    </label>
                    <input
                      type="password"
                      className="pwa-welcome-input"
                      placeholder="Ripeti la password"
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRegisterNext}
                    className="pwa-welcome-btn"
                  >
                    Avanti
                  </button>
                </>
              )}

              {registerStep === 2 && (
                <>
                  <p className="pwa-welcome-step-title">
                    Come vuoi procedere?
                  </p>
                  <button
                    type="button"
                    className={`pwa-welcome-choice ${
                      coupleChoice === "join"
                        ? "pwa-welcome-choice-active"
                        : ""
                    }`}
                    onClick={() => setCoupleChoice("join")}
                  >
                    <span className="material-symbols-outlined">
                      person_add
                    </span>
                    <div>
                      <strong>Unisciti a una coppia</strong>
                      <span>Usa l'ID che ti ha dato il partner</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`pwa-welcome-choice ${
                      coupleChoice === "create"
                        ? "pwa-welcome-choice-active"
                        : ""
                    }`}
                    onClick={() => setCoupleChoice("create")}
                  >
                    <span className="material-symbols-outlined">favorite</span>
                    <div>
                      <strong>Crea una nuova coppia</strong>
                      <span>Inizia la vostra storia</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleRegisterNext}
                    className="pwa-welcome-btn"
                  >
                    Avanti
                  </button>
                </>
              )}

              {registerStep === 3 && (
                <form
                  onSubmit={handleRegisterSubmit}
                  className="pwa-welcome-form"
                >
                  <h2 className="pwa-welcome-step-title">
                    {coupleChoice === "join"
                      ? "Unisciti alla coppia"
                      : "Crea la coppia"}
                  </h2>

                  {coupleChoice === "join" ? (
                    <div className="pwa-welcome-field">
                      <label className="pwa-welcome-label">ID Coppia</label>
                      <input
                        type="text"
                        className="pwa-welcome-input"
                        placeholder="Inserisci l'ID della coppia"
                        value={registerData.coupleId ?? ""}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            coupleId: e.target.value,
                          })
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <div className="pwa-welcome-field">
                        <label className="pwa-welcome-label">
                          Nome della coppia
                        </label>
                        <input
                          type="text"
                          className="pwa-welcome-input"
                          placeholder="Es. Alice & Bob"
                          value={registerData.coupleName ?? ""}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              coupleName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="pwa-welcome-field">
                        <label className="pwa-welcome-label">
                          Data anniversario
                        </label>
                        <input
                          type="date"
                          className="pwa-welcome-input"
                          value={registerData.anniversaryDate ?? ""}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              anniversaryDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                  <button type="submit" className="pwa-welcome-btn">
                    Completa registrazione
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
