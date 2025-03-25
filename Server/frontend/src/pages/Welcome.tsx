
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Link,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  useTheme,
  Avatar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { alpha } from '@mui/system';

const steps = ['Scegli il tipo di registrazione', 'Inserisci i dati'];

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, registerWithExistingCouple, registerWithNewCouple } = useAuth();
  const [mode, setMode] = useState<'accedi' | 'registrati'>('accedi');
  const [activeStep, setActiveStep] = useState(0);
  const [registrationType, setRegistrationType] = useState<'join' | 'new'>('new');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    coupleId: '',
    coupleName: '',
    anniversaryDate: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'accedi') {
      try {
        await login(formData.email, formData.password);
      } catch (err) {
        // L'errore viene già gestito nel contesto di autenticazione
      }
    } else {
      try {
        if (registrationType === 'join') {
          await registerWithExistingCouple(
            formData.name,
            formData.email,
            formData.password,
            formData.coupleId
          );
        } else {
          await registerWithNewCouple(
            formData.name,
            formData.email,
            formData.password,
            formData.coupleName,
            formData.anniversaryDate
          );
        }
      } catch (err) {
        // L'errore viene già gestito nel contesto di autenticazione
      }
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const renderRegistrationStep = () => {
    if (activeStep === 0) {
      return (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Come vuoi registrarti?
          </Typography>
          <Button
            variant={registrationType === 'new' ? 'contained' : 'outlined'}
            onClick={() => setRegistrationType('new')}
            fullWidth
            sx={{ 
              mb: 2,
              borderRadius: 2,
              p: 2,
              textTransform: 'none',
              fontWeight: registrationType === 'new' ? 600 : 500,
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 2,
              background: registrationType === 'new'
                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                : 'transparent',
              '&:hover': {
                background: registrationType === 'new'
                  ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                  : alpha(theme.palette.primary.main, 0.1),
              },
              boxShadow: registrationType === 'new'
                ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                : 'none',
            }}
            startIcon={
              <Avatar 
                sx={{ 
                  bgcolor: registrationType === 'new' 
                    ? alpha('#fff', 0.9) 
                    : alpha(theme.palette.primary.main, 0.1),
                  color: registrationType === 'new' 
                    ? theme.palette.primary.main 
                    : theme.palette.primary.main,
                }}
              >
                <FavoriteIcon />
              </Avatar>
            }
          >
            <Box sx={{ textAlign: 'left' }}>
              Crea una nuova coppia
              <Typography variant="caption" color={registrationType === 'new' ? "inherit" : "text.secondary"} sx={{ display: 'block' }}>
                Inizia da zero con il tuo partner
              </Typography>
            </Box>
          </Button>
          <Button
            variant={registrationType === 'join' ? 'contained' : 'outlined'}
            onClick={() => setRegistrationType('join')}
            fullWidth
            sx={{ 
              borderRadius: 2,
              p: 2,
              textTransform: 'none',
              fontWeight: registrationType === 'join' ? 600 : 500,
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 2,
              background: registrationType === 'join'
                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                : 'transparent',
              '&:hover': {
                background: registrationType === 'join'
                  ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                  : alpha(theme.palette.primary.main, 0.1),
              },
              boxShadow: registrationType === 'join'
                ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                : 'none',
            }}
            startIcon={
              <Avatar 
                sx={{ 
                  bgcolor: registrationType === 'join' 
                    ? alpha('#fff', 0.9) 
                    : alpha(theme.palette.primary.main, 0.1),
                  color: registrationType === 'join' 
                    ? theme.palette.primary.main 
                    : theme.palette.primary.main,
                }}
              >
                <GroupIcon />
              </Avatar>
            }
          >
            <Box sx={{ textAlign: 'left' }}>
              Unisciti a una coppia esistente
              <Typography variant="caption" color={registrationType === 'join' ? "inherit" : "text.secondary"} sx={{ display: 'block' }}>
                Inserisci l'ID coppia del tuo partner
              </Typography>
            </Box>
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            fullWidth
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              mt: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              p: 1.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            Avanti
          </Button>
        </Box>
      );
    }

    return (
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
              }
            }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
              }
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
              }
            }}
          />
          {registrationType === 'join' ? (
            <TextField
              fullWidth
              label="ID Coppia"
              name="coupleId"
              value={formData.coupleId}
              onChange={handleInputChange}
              required
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: 2,
                }
              }}
            />
          ) : (
            <>
              <TextField
                fullWidth
                label="Nome Coppia"
                name="coupleName"
                value={formData.coupleName}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                fullWidth
                label="Data Anniversario"
                name="anniversaryDate"
                type="date"
                value={formData.anniversaryDate}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                  }
                }}
              />
            </>
          )}
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              fullWidth
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                p: 1.5,
              }}
            >
              Indietro
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                p: 1.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              Registrati
            </Button>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'stretch',
      }}
    >
      {/* Left Panel - Decorative */}
      <Box
        sx={{
          flex: { xs: 'none', md: 1 },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'url("https://source.unsplash.com/random/1200x900/?couple,love")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Memory Grove
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, fontWeight: 300 }}>
            La tua storia d'amore in un'app. Conserva i ricordi più belli della vostra relazione.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 3,
              textAlign: 'left',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              p: 4,
              borderRadius: 3,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>1</Avatar>
              <Typography variant="body1">
                Registrati con il tuo partner e collegate i vostri account
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>2</Avatar>
              <Typography variant="body1">
                Crea ricordi, salvate foto e tenete traccia dei vostri momenti speciali
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>3</Avatar>
              <Typography variant="body1">
                Pianificate le vostre prossime attività insieme e restate connessi
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Panel - Login/Register Form */}
      <Box
        sx={{
          flex: { xs: 1, md: 1 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: 'background.paper',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.1),
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, value) => {
                  if (value) {
                    setMode(value);
                    setActiveStep(0);
                    setError(null);
                  }
                }}
                aria-label="auth mode"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 3,
                  p: 0.5,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                  '.MuiToggleButtonGroup-grouped': {
                    border: 'none',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&.Mui-selected': {
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="accedi">Accedi</ToggleButton>
                <ToggleButton value="registrati">Registrati</ToggleButton>
              </ToggleButtonGroup>

              <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
                {mode === 'accedi' ? 'Bentornato' : 'Benvenuto'}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" align="center">
                {mode === 'accedi'
                  ? 'Inserisci le tue credenziali per accedere'
                  : 'Inserisci le tue credenziali per registrarti'}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {mode === 'registrati' ? (
                <>
                  <Stepper 
                    activeStep={activeStep} 
                    sx={{ 
                      width: '100%', 
                      mb: 2,
                      '.MuiStepLabel-label': {
                        fontWeight: 500,
                      },
                      '.MuiStepLabel-label.Mui-active': {
                        fontWeight: 600,
                      },
                    }}
                  >
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  {renderRegistrationStep()}
                </>
              ) : (
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, width: '100%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                        sx: {
                          borderRadius: 2,
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: <LockIcon color="action" sx={{ mr: 1 }} />,
                        sx: {
                          borderRadius: 2,
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 500,
                        p: 1.5,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Accedi
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Welcome;
