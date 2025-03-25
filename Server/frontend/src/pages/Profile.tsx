
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  CircularProgress,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
  Chip,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import FaceIcon from '@mui/icons-material/Face';
import PaletteIcon from '@mui/icons-material/Palette';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { User, Couple } from '../types/api';
import { alpha } from '@mui/system';
import { toast } from 'react-hot-toast';

interface FormData {
  name: string;
  email: string;
  biography: string;
  themePreference: 'light' | 'dark';
  coupleName: string;
  anniversaryDate: string;
}

const Profile: React.FC = () => {
  const { user: authUser, login } = useAuth();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [coupleDetails, setCoupleDetails] = useState<Couple | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    biography: '',
    themePreference: 'light',
    coupleName: '',
    anniversaryDate: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!authUser?.id || !authUser?.coupleId) return;

      try {
        setIsLoading(true);
        const [userRes, coupleRes] = await Promise.all([
          api.getUserProfile(authUser.id),
          api.getCoupleDetails(authUser.coupleId),
        ]);

        const userData = userRes.data.data;
        const coupleData = coupleRes.data.data;

        setUserDetails(userData);
        setCoupleDetails(coupleData);
        setFormData({
          name: userData.name,
          email: userData.email,
          biography: userData.biography || '',
          themePreference: userData.themePreference || 'light',
          coupleName: coupleData.name,
          anniversaryDate: coupleData.anniversaryDate || '',
        });
        setError(null);
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
        console.error('Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [authUser?.id, authUser?.coupleId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!authUser?.id || !authUser?.coupleId) return;

    try {
      setIsLoading(true);

      // Update user profile
      const userUpdateData = {
        name: formData.name,
        biography: formData.biography,
        themePreference: formData.themePreference,
      };

      if (profilePicture) {
        await api.updateUserProfile(authUser.id, profilePicture);
      }

      const userRes = await api.updateUserProfile(authUser.id, userUpdateData);

      // Update couple details
      const coupleUpdateData = {
        name: formData.coupleName,
        anniversaryDate: formData.anniversaryDate,
      };
      const coupleRes = await api.updateCoupleDetails(authUser.coupleId, coupleUpdateData);

      setUserDetails(userRes.data.data);
      setCoupleDetails(coupleRes.data.data);
      setEditMode(false);
      setError(null);
      setProfilePicturePreview(null);
      toast.success('Profilo aggiornato con successo!');

      // Update auth context with new user data
      login(formData.email, ''); // This will refresh the user data
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
      toast.error('Impossibile aggiornare il profilo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setProfilePicture(null);
    setProfilePicturePreview(null);
    
    // Reset form data to current details
    if (userDetails && coupleDetails) {
      setFormData({
        name: userDetails.name,
        email: userDetails.email,
        biography: userDetails.biography || '',
        themePreference: userDetails.themePreference || 'light',
        coupleName: coupleDetails.name,
        anniversaryDate: coupleDetails.anniversaryDate || '',
      });
    }
  };

  if (isLoading && !userDetails) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 3 }}>
        Il tuo Profilo
      </Typography>

      {error && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3,
            bgcolor: alpha(theme.palette.error.main, 0.05),
            border: '1px solid',
            borderColor: alpha(theme.palette.error.main, 0.2),
          }}
        >
          <Typography color="error">
            {error}
          </Typography>
        </Paper>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(145deg, rgba(26, 32, 39, 0.8) 0%, rgba(10, 25, 41, 0.9) 100%)' 
                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(246, 246, 250, 0.95) 100%)',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.03)',
            }}
          >
            <Box sx={{ position: 'relative', mb: 3 }}>
              <Avatar
                src={profilePicturePreview || userDetails?.profilePicture}
                sx={{ 
                  width: 150, 
                  height: 150, 
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                  border: '4px solid',
                  borderColor: theme.palette.primary.main,
                }}
              />
              {editMode && (
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    }
                  }}
                >
                  <PhotoCameraIcon />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </IconButton>
              )}
            </Box>

            <Typography variant="h5" fontWeight="bold" align="center">
              {userDetails?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              {userDetails?.email}
            </Typography>

            {!editMode && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                sx={{ 
                  mt: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
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
                Modifica Profilo
              </Button>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: 3,
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.03)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Informazioni Personali
              </Typography>
              {editMode && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Annulla
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    }}
                  >
                    Salva
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <FaceIcon color="primary" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Nome
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                          }
                        }}
                      />
                    ) : (
                      <Typography variant="body1" fontWeight={500}>
                        {userDetails?.name}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <EmailIcon color="primary" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {userDetails?.email}
                    </Typography>
                    {editMode && (
                      <Typography variant="caption" color="text.secondary">
                        L'email non può essere modificata
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                    <PaletteIcon color="info" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tema
                    </Typography>
                    {editMode ? (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.themePreference === 'dark'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              themePreference: e.target.checked ? 'dark' : 'light'
                            }))}
                          />
                        }
                        label={formData.themePreference === 'dark' ? 'Tema Scuro' : 'Tema Chiaro'}
                      />
                    ) : (
                      <Chip
                        label={userDetails?.themePreference === 'dark' ? 'Tema Scuro' : 'Tema Chiaro'}
                        size="small"
                        color={userDetails?.themePreference === 'dark' ? 'default' : 'primary'}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                    <FavoriteIcon color="secondary" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Nome Coppia
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        name="coupleName"
                        value={formData.coupleName}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                          }
                        }}
                      />
                    ) : (
                      <Typography variant="body1" fontWeight={500}>
                        {coupleDetails?.name}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                    <CalendarTodayIcon color="secondary" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Data Anniversario
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        name="anniversaryDate"
                        type="date"
                        value={formData.anniversaryDate}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                          }
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : (
                      <Typography variant="body1" fontWeight={500}>
                        {coupleDetails?.anniversaryDate 
                          ? new Date(coupleDetails.anniversaryDate).toLocaleDateString('it-IT') 
                          : 'Non impostata'}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Biografia
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="biography"
                    value={formData.biography}
                    onChange={handleInputChange}
                    placeholder="Scrivi qualcosa su di te..."
                    variant="outlined"
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                      }
                    }}
                  />
                ) : (
                  <Typography variant="body1">
                    {userDetails?.biography || 'Nessuna biografia impostata'}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>

          {!editMode && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mt: 3,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  ID Coppia
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Condividi questo ID con il tuo partner per connettervi
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }} />
              <Chip
                label={authUser?.coupleId}
                color="primary"
                variant="outlined"
                sx={{ 
                  borderRadius: 2, 
                  px: 1,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }}
                onClick={() => {
                  if (authUser?.coupleId) {
                    navigator.clipboard.writeText(authUser.coupleId.toString());
                    toast.success('ID copiato negli appunti!');
                  }
                }}
              />
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
