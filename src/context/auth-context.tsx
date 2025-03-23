
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Couple } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  couple: Couple | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  updateCouple: (couple: Partial<Couple>) => Promise<void>;
  createCouple: (name: string, description?: string) => Promise<void>;
  inviteToCouple: (email: string) => Promise<void>;
  acceptInvitation: (coupleId: string) => Promise<void>;
  leaveCouple: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  couple: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateUser: async () => {},
  updateCouple: async () => {},
  createCouple: async () => {},
  inviteToCouple: async () => {},
  acceptInvitation: async () => {},
  leaveCouple: async () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
    coupleId: 'couple1',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: new Date(),
    coupleId: 'couple1',
  },
  {
    id: '3',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    createdAt: new Date(),
  }
];

// Mock couple
const MOCK_COUPLE: Couple = {
  id: 'couple1',
  name: 'John & Jane',
  description: 'Together since 2020',
  createdAt: new Date(),
  members: [MOCK_USERS[0], MOCK_USERS[1]]
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Check if user is part of a couple
        if (parsedUser.coupleId) {
          const storedCouple = localStorage.getItem('couple');
          if (storedCouple) {
            setCouple(JSON.parse(storedCouple));
          } else {
            // For demo, if the user has coupleId but no couple in localStorage
            if (parsedUser.coupleId === 'couple1') {
              localStorage.setItem('couple', JSON.stringify(MOCK_COUPLE));
              setCouple(MOCK_COUPLE);
            }
          }
        }
      }
      setLoading(false);
    };

    // Simulate a delay for loading state
    const timer = setTimeout(() => {
      checkAuth();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = MOCK_USERS.find(u => u.email === email);
      
      if (foundUser && password === 'password') {
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        
        // If user is part of a couple, set the couple
        if (foundUser.coupleId === 'couple1') {
          setCouple(MOCK_COUPLE);
          localStorage.setItem('couple', JSON.stringify(MOCK_COUPLE));
        }
        
        console.log('User signed in:', foundUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        createdAt: new Date(),
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      console.log('User signed up:', newUser);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    try {
      // Simulate sign out
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      setCouple(null);
      localStorage.removeItem('user');
      localStorage.removeItem('couple');
      console.log('User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      // Simulate update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('User updated:', updatedUser);
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create couple function
  const createCouple = async (name: string, description?: string) => {
    setLoading(true);
    try {
      // Simulate creating a couple
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (user) {
        const newCouple: Couple = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          description,
          createdAt: new Date(),
          members: [user]
        };
        
        // Update user with coupleId
        const updatedUser = { ...user, coupleId: newCouple.id };
        setUser(updatedUser);
        setCouple(newCouple);
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('couple', JSON.stringify(newCouple));
        
        console.log('Couple created:', newCouple);
        toast.success('Coppia creata con successo!');
      }
    } catch (error) {
      console.error('Create couple error:', error);
      toast.error('Errore nella creazione della coppia');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update couple function
  const updateCouple = async (coupleData: Partial<Couple>) => {
    setLoading(true);
    try {
      // Simulate update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (couple) {
        const updatedCouple = { ...couple, ...coupleData };
        setCouple(updatedCouple);
        localStorage.setItem('couple', JSON.stringify(updatedCouple));
        console.log('Couple updated:', updatedCouple);
        toast.success('Informazioni della coppia aggiornate!');
      }
    } catch (error) {
      console.error('Update couple error:', error);
      toast.error('Errore nell\'aggiornamento delle informazioni');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Invite to couple function
  const inviteToCouple = async (email: string) => {
    setLoading(true);
    try {
      // Simulate invitation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would send an email with an invitation link
      console.log(`Invitation sent to ${email}`);
      toast.success(`Invito inviato a ${email}`);
    } catch (error) {
      console.error('Invite to couple error:', error);
      toast.error('Errore nell\'invio dell\'invito');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Accept invitation function
  const acceptInvitation = async (coupleId: string) => {
    setLoading(true);
    try {
      // Simulate accepting invitation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (user) {
        // For demo purposes, use the MOCK_COUPLE
        const targetCouple = { ...MOCK_COUPLE };
        
        // Update user
        const updatedUser = { ...user, coupleId };
        setUser(updatedUser);
        
        // Update couple by adding the user
        if (!targetCouple.members.find(m => m.id === user.id)) {
          targetCouple.members.push(updatedUser);
        }
        setCouple(targetCouple);
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('couple', JSON.stringify(targetCouple));
        
        console.log('Invitation accepted:', coupleId);
        toast.success('Hai accettato l\'invito!');
      }
    } catch (error) {
      console.error('Accept invitation error:', error);
      toast.error('Errore nell\'accettare l\'invito');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Leave couple function
  const leaveCouple = async () => {
    setLoading(true);
    try {
      // Simulate leaving couple
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (user && couple) {
        // Update user
        const updatedUser = { ...user };
        delete updatedUser.coupleId;
        setUser(updatedUser);
        
        // Update couple by removing the user
        const updatedCouple = {
          ...couple,
          members: couple.members.filter(m => m.id !== user.id)
        };
        
        // If no members left, remove the couple, otherwise update it
        if (updatedCouple.members.length === 0) {
          localStorage.removeItem('couple');
          setCouple(null);
        } else {
          localStorage.setItem('couple', JSON.stringify(updatedCouple));
          setCouple(updatedCouple);
        }
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log('Left couple');
        toast.success('Hai abbandonato la coppia');
      }
    } catch (error) {
      console.error('Leave couple error:', error);
      toast.error('Errore nell\'abbandonare la coppia');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    couple,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
    updateCouple,
    createCouple,
    inviteToCouple,
    acceptInvitation,
    leaveCouple,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
