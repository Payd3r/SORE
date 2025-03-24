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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { User, Couple } from '../types/api';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
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
      setProfilePicture(e.target.files[0]);
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

      // Update auth context with new user data
      login(formData.email, ''); // This will refresh the user data
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Il tuo Profilo</Typography>
          <IconButton 
            onClick={() => setEditMode(!editMode)}
            color={editMode ? 'error' : 'primary'}
          >
            {editMode ? <CancelIcon /> : <EditIcon />}
          </IconButton>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                src={userDetails?.profilePictureUrl}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
              {editMode && (
                <Button
                  component="label"
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Cambia Foto
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Informazioni Personali
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                  <TextField
                    fullWidth
                    label="Biografia"
                    name="biography"
                    value={formData.biography}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    multiline
                    rows={3}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.themePreference === 'dark'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          themePreference: e.target.checked ? 'dark' : 'light'
                        }))}
                        disabled={!editMode}
                      />
                    }
                    label="Tema Scuro"
                  />
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Informazioni Coppia
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Nome Coppia"
                    name="coupleName"
                    value={formData.coupleName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                  <TextField
                    fullWidth
                    label="Data Anniversario"
                    name="anniversaryDate"
                    type="date"
                    value={formData.anniversaryDate}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
              </Box>

              {editMode && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    Salva Modifiche
                  </Button>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
