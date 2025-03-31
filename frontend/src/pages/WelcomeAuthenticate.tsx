import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, registerWithCouple, registerNewCouple } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type AuthMode = 'login' | 'register';
type RegisterStep = 1 | 2 | 3;
type CoupleChoice = 'join' | 'create' | null;

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  coupleId?: string;
  coupleName?: string;
  anniversaryDate?: string;
}

const WelcomeAuthenticate = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
  const [coupleChoice, setCoupleChoice] = useState<CoupleChoice>(null);
  const [error, setError] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  
  // Form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await login({
        email: loginData.email,
        password: loginData.password
      });      
      authLogin(response);
      navigate('/');
    } catch (err) {
      console.error('[WelcomeAuthenticate] Login error:', err);
      setError(err instanceof Error ? err.message : 'Errore durante il login');
    }
  };

  const handleRegisterNext = () => {
    if (registerStep === 1) {
      // Validazione step 1
      if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
        setError('Tutti i campi sono obbligatori');
        return;
      }
      if (registerData.password !== registerData.confirmPassword) {
        setError('Le password non coincidono');
        return;
      }
      if (registerData.password.length < 6) {
        setError('La password deve essere di almeno 6 caratteri');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerData.email)) {
        setError('Email non valida');
        return;
      }
      setRegisterStep(2);
    } else if (registerStep === 2) {
      if (!coupleChoice) {
        setError('Seleziona un\'opzione');
        return;
      }
      setRegisterStep(3);
    }
    setError('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      if (coupleChoice === 'join') {
        if (!registerData.coupleId) {
          setError('Inserisci l\'ID della coppia');
          return;
        }
        response = await registerWithCouple({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          coupleId: registerData.coupleId
        });
      } else {
        if (!registerData.coupleName || !registerData.anniversaryDate) {
          setError('Tutti i campi sono obbligatori');
          return;
        }
        response = await registerNewCouple({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          coupleName: registerData.coupleName,
          anniversaryDate: registerData.anniversaryDate
        });
      }
      
      authLogin(response);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la registrazione');
    }
  };

  return (
    <div className={`min-h-screen h-screen w-screen flex flex-col items-center justify-center ${
      theme === 'light' 
        ? 'bg-gray-50' 
        : 'bg-[#121212]'
    } p-4 sm:p-6 md:p-8 overflow-x-hidden`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg bg-transparent focus:outline-none"
        aria-label={theme === 'light' ? 'Passa al tema scuro' : 'Passa al tema chiaro'}
      >
        {theme === 'light' ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.32031 11.6835C3.32031 16.6541 7.34975 20.6835 12.3203 20.6835C16.1075 20.6835 19.3483 18.3443 20.6768 15.032C19.6402 15.4486 18.5059 15.6835 17.3203 15.6835C12.3497 15.6835 8.32031 11.6541 8.32031 6.68359C8.32031 5.49796 8.55517 4.36367 8.97181 3.32715C5.65957 4.65561 3.32031 7.89639 3.32031 11.6835Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3V4M12 20V21M4 12H3M6.31412 6.31412L5.5 5.5M17.6859 6.31412L18.5 5.5M6.31412 17.69L5.5 18.5001M17.6859 17.69L18.5 18.5001M21 12H20M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <div className="w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'} mb-2`}>
            Album <span className="text-[#4d88ff]">Tecnologico</span>
          </h1>
          <p className={`text-base ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Benvenuto nei tuoi ricordi speciali
          </p>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className={`relative w-full ${
            theme === 'light'
              ? 'bg-white shadow-md border border-gray-100'
              : 'bg-[#1e1e1e] border border-[#252525] shadow-2xl'
          } rounded-2xl p-5 sm:p-6`}>
            {/* Card Icons */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#4d88ff] flex items-center justify-center shadow-lg shadow-[#4d88ff]/20">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.31802 6.31802C2.56066 8.07538 2.56066 10.9246 4.31802 12.682L12 20.364L19.682 12.682C21.4393 10.9246 21.4393 8.07538 19.682 6.31802C17.9246 4.56066 15.0754 4.56066 13.318 6.31802L12 7.63604L10.682 6.31802C8.92462 4.56066 6.07538 4.56066 4.31802 6.31802Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'light'
                  ? 'bg-white border border-gray-200'
                  : 'bg-[#1e1e1e] border border-[#252525]'
              }`}>
                <svg className="w-4 h-4 text-[#4d88ff]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 9V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V9M12 14V17M8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C17.7202 10 16.8802 10 15.2 10H8.8C7.11984 10 6.27976 10 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Toggle Login/Register */}
            <div className="mb-6">
              <div className="tab-menu">
                <button
                  className={`tab-menu-item ${
                    mode === 'login'
                      ? 'tab-menu-item-active'
                      : 'tab-menu-item-inactive'
                  }`}
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                >
                  Accedi
                </button>
                <button
                  className={`tab-menu-item ${
                    mode === 'register'
                      ? 'tab-menu-item-active'
                      : 'tab-menu-item-inactive'
                  }`}
                  onClick={() => {
                    setMode('register');
                    setRegisterStep(1);
                    setCoupleChoice(null);
                    setError('');
                  }}
                >
                  Registrati
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`mb-6 p-3 rounded-lg ${
                theme === 'light'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-red-900/20 border border-red-800/50'
              }`}>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-red-600' : 'text-red-400'
                }`}>{error}</p>
              </div>
            )}

            {/* Forms */}
            <div className="max-w-full overflow-x-hidden">
              {/* Login Form */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className={`block text-sm font-medium ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      Email
                    </label>
                    <input
                      type="email"
                      className="input-base"
                      placeholder="Il tuo indirizzo email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-sm font-medium ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      Password
                    </label>
                    <input
                      type="password"
                      className="input-base"
                      placeholder="La tua password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full focus:outline-none focus:ring-0"
                  >
                    Accedi
                  </button>
                </form>
              )}

              {/* Register Forms */}
              {mode === 'register' && (
                <div className="space-y-6 max-w-full">
                  {/* Step Indicator */}
                  <div className="flex justify-between items-center mb-6 relative">
                    <div className={`absolute h-0.5 w-full top-4 -z-10 ${
                      theme === 'light' ? 'bg-gray-200' : 'bg-[#252525]'
                    }`}></div>
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          step === registerStep
                            ? 'bg-[#4d88ff] text-white'
                            : step < registerStep
                            ? 'bg-green-500 text-white'
                            : theme === 'light'
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-[#252525] text-gray-400'
                        }`}>
                          {step < registerStep ? '✓' : step}
                        </div>
                        <div className={`text-xs mt-2 font-medium ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {step === 1 ? 'Dati' : step === 2 ? 'Scelta' : 'Coppia'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Step 1: User Info */}
                  {registerStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <label className={`block text-sm font-medium ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>
                          Nome
                        </label>
                        <input
                          type="text"
                          className="input-base"
                          placeholder="Il tuo nome"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={`block text-sm font-medium ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>
                          Email
                        </label>
                        <input
                          type="email"
                          className="input-base"
                          placeholder="Il tuo indirizzo email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={`block text-sm font-medium ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>
                          Password
                        </label>
                        <input
                          type="password"
                          className="input-base"
                          placeholder="Scegli una password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={`block text-sm font-medium ${
                          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>
                          Conferma Password
                        </label>
                        <input
                          type="password"
                          className="input-base"
                          placeholder="Conferma la password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Choose Couple Option */}
                  {registerStep === 2 && (
                    <div className="space-y-4">
                      <button
                        className={`w-full p-6 rounded-xl border transition-all duration-300 hover:shadow-md ${
                          coupleChoice === 'join'
                            ? 'btn-primary'
                            : 'btn-secondary'
                        }`}
                        onClick={() => setCoupleChoice('join')}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                            coupleChoice === 'join'
                              ? 'bg-[#4d88ff] text-white'
                              : theme === 'light'
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-[#1e1e1e] text-gray-400'
                          }`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                          </div>
                          <div className="flex-1 text-left">
                            <div className={`font-semibold text-base transition-colors duration-300 ${
                              theme === 'light'
                                ? coupleChoice === 'join' ? 'text-gray-900' : 'text-gray-700'
                                : coupleChoice === 'join' ? 'text-white' : 'text-gray-300'
                            }`}>
                              Unisciti a una coppia esistente
                            </div>
                            <div className={`text-sm mt-1 transition-colors duration-300 ${
                              theme === 'light' 
                                ? coupleChoice === 'join' ? 'text-gray-600' : 'text-gray-500'
                                : coupleChoice === 'join' ? 'text-gray-200' : 'text-gray-400'
                            }`}>
                              Usa l'ID della coppia per unirti al tuo partner
                            </div>
                          </div>
                        </div>
                      </button>

                      <button
                        className={`w-full p-6 rounded-xl border transition-all duration-300 hover:shadow-md ${
                          coupleChoice === 'create'
                            ? 'btn-primary'
                            : 'btn-secondary'
                        }`}
                        onClick={() => setCoupleChoice('create')}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                            coupleChoice === 'create'
                              ? 'bg-[#4d88ff] text-white'
                              : theme === 'light'
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-[#1e1e1e] text-gray-400'
                          }`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 text-left">
                            <div className={`font-semibold text-base transition-colors duration-300 ${
                              theme === 'light'
                                ? coupleChoice === 'create' ? 'text-gray-900' : 'text-gray-700'
                                : coupleChoice === 'create' ? 'text-white' : 'text-gray-300'
                            }`}>
                              Crea una nuova coppia
                            </div>
                            <div className={`text-sm mt-1 transition-colors duration-300 ${
                              theme === 'light'
                                ? coupleChoice === 'create' ? 'text-gray-600' : 'text-gray-500'
                                : coupleChoice === 'create' ? 'text-gray-200' : 'text-gray-400'
                            }`}>
                              Inizia una nuova storia d'amore
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Step 3: Couple Details */}
                  {registerStep === 3 && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-6">
                      <h2 className="text-2xl font-bold text-[#4d88ff] text-center mb-6">
                        {coupleChoice === 'join' ? 'Unisciti alla coppia' : 'Crea una nuova coppia'}
                      </h2>
                      
                      {coupleChoice === 'join' ? (
                        <div className="space-y-1">
                          <label className={`block text-sm font-medium ${
                            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                          }`}>
                            ID Coppia
                          </label>
                          <input
                            type="text"
                            className="input-base"
                            placeholder="Inserisci l'ID della coppia"
                            value={registerData.coupleId || ''}
                            onChange={(e) => setRegisterData({ ...registerData, coupleId: e.target.value })}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <label className={`block text-sm font-medium ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              Nome della Coppia
                            </label>
                            <input
                              type="text"
                              className="input-base"
                              placeholder="Es. Alice & Bob"
                              value={registerData.coupleName || ''}
                              onChange={(e) => setRegisterData({ ...registerData, coupleName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={`block text-sm font-medium ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              Data Anniversario
                            </label>
                            <div className="date-picker-container">
                              <DatePicker
                                selected={registerData.anniversaryDate ? new Date(registerData.anniversaryDate) : null}
                                onChange={(date) => setRegisterData({ 
                                  ...registerData, 
                                  anniversaryDate: date ? format(date, 'yyyy-MM-dd') : '' 
                                })}
                                dateFormat="dd/MM/yyyy"
                                locale={it}
                                placeholderText="Seleziona la data dell'anniversario"
                              />
                            </div>
                          </div>
                        </>
                      )}
                      <button
                        type="submit"
                        className="btn-primary w-full focus:outline-none focus:ring-0"
                      >
                        Completa Registrazione
                      </button>
                    </form>
                  )}

                  {/* Navigation Buttons */}
                  {mode === 'register' && registerStep !== 3 && (
                    <div className="mt-6">
                      <button
                        onClick={handleRegisterNext}
                        className="btn-primary w-full focus:outline-none focus:ring-0"
                      >
                        Avanti
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAuthenticate; 