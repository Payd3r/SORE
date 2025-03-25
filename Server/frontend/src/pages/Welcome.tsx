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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const steps = ['Scegli il tipo di registrazione', 'Inserisci i dati'];

const Welcome: React.FC = () => {
  const navigate = useNavigate();
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
          <Typography variant="h6" gutterBottom>
            Come vuoi registrarti?
          </Typography>
          <Button
            variant={registrationType === 'new' ? 'contained' : 'outlined'}
            onClick={() => setRegistrationType('new')}
            fullWidth
            sx={{ mb: 2 }}
          >
            Crea una nuova coppia
          </Button>
          <Button
            variant={registrationType === 'join' ? 'contained' : 'outlined'}
            onClick={() => setRegistrationType('join')}
            fullWidth
          >
            Unisciti a una coppia esistente
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            fullWidth
            sx={{ mt: 2 }}
          >
            Avanti
          </Button>
        </Box>
      );
    }

    return (
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
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
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
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
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
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
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
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
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
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
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </>
          )}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              fullWidth
              disabled={activeStep === 0}
            >
              Indietro
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
            >
              {mode === 'accedi' ? 'Accedi' : 'Registrati'}
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
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: 'background.paper',
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
                bgcolor: 'background.paper',
                borderRadius: 3,
                p: 0.5,
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="accedi">Accedi</ToggleButton>
              <ToggleButton value="registrati">Registrati</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="h4" component="h1" gutterBottom align="center">
              {mode === 'accedi' ? 'Bentornato' : 'Benvenuto'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" align="center">
              {mode === 'accedi'
                ? 'Inserisci le tue credenziali per accedere'
                : 'Inserisci le tue credenziali per registrarti'}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            )}

            {mode === 'registrati' ? (
              <>
                <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 2 }}>
                  <Step>
                    <StepLabel>Scegli il tipo di registrazione</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Inserisci i dati</StepLabel>
                  </Step>
                </Stepper>
                {renderRegistrationStep()}
              </>
            ) : (
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, width: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
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
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
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
  );
};

export default Welcome;
