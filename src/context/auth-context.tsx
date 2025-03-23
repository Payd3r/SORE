import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { app } from '@/firebase';
import { User, Couple } from '@/types';
import { toast } from 'sonner';

interface AuthContextProps {
  user: User | null;
  couple: Couple | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (name: string, avatar?: string, bio?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  createCouple: (name: string, description?: string) => Promise<void>;
  joinCouple: (coupleId: string) => Promise<void>;
  leaveCouple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const appleProvider = new OAuthProvider('apple.com');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);

          if (userData.coupleId) {
            const coupleDoc = await getDoc(doc(db, 'couples', userData.coupleId));
            if (coupleDoc.exists()) {
              setCouple(coupleDoc.data() as Couple);
            } else {
              setCouple(null);
            }
          } else {
            setCouple(null);
          }
        } else {
          setUser(null);
          setCouple(null);
        }
      } else {
        setUser(null);
        setCouple(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });

      const newUser: User = {
        id: firebaseUser.uid,
        name: name,
        email: firebaseUser.email as string,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      setUser(newUser);
      toast.success('Registrazione avvenuta con successo!');
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error(`Errore durante la registrazione: ${error.message}`);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login effettuato con successo!');
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error(`Errore durante il login: ${error.message}`);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Logout effettuato con successo!');
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.error(`Errore durante il logout: ${error.message}`);
    }
  };

  const updateUser = async (name: string, avatar?: string, bio?: string) => {
    try {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        await updateProfile(firebaseUser, { displayName: name, photoURL: avatar });

        const updatedUser: User = {
          ...user as User,
          name: name,
          avatar: avatar,
          bio: bio
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser);
        setUser(updatedUser);
        toast.success('Profilo aggiornato con successo!');
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(`Errore durante l'aggiornamento del profilo: ${error.message}`);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName as string,
          email: firebaseUser.email as string,
          avatar: firebaseUser.photoURL,
          createdAt: new Date(),
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        setUser(newUser);
      }
      toast.success('Login con Google effettuato con successo!');
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast.error(`Errore durante il login con Google: ${error.message}`);
    }
  };

  const signInWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const firebaseUser = result.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName as string,
          email: firebaseUser.email as string,
          avatar: firebaseUser.photoURL,
          createdAt: new Date(),
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        setUser(newUser);
      }
      toast.success('Login con Facebook effettuato con successo!');
    } catch (error: any) {
      console.error("Error signing in with Facebook:", error);
      toast.error(`Errore durante il login con Facebook: ${error.message}`);
    }
  };

  const signInWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const firebaseUser = result.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        // Apple doesn't provide a photoURL
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName as string,
          email: firebaseUser.email as string,
          createdAt: new Date(),
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        setUser(newUser);
      }
      toast.success('Login con Apple effettuato con successo!');
    } catch (error: any) {
      console.error("Error signing in with Apple:", error);
      toast.error(`Errore durante il login con Apple: ${error.message}`);
    }
  };

  const createCouple = (name: string, description?: string) => {
    const coupleId = `couple-${Date.now()}`;
    const newCouple: Couple = {
      id: coupleId,
      name,
      description,
      startDate: new Date(), // Add the required startDate
      members: [user as User],
      createdAt: new Date()
    };

    setDoc(doc(db, 'couples', coupleId), newCouple)
      .then(() => {
        // Update the user document with the coupleId
        if (user) {
          const updatedUser: User = { ...user, coupleId: coupleId };
          setDoc(doc(db, 'users', user.id), updatedUser)
            .then(() => {
              setUser(updatedUser);
              setCouple(newCouple);
              toast.success('Coppia creata con successo!');
            })
            .catch((error) => {
              console.error("Error updating user with coupleId:", error);
              toast.error(`Errore durante l'aggiornamento dell'utente con l'ID della coppia: ${error.message}`);
            });
        }
      })
      .catch((error) => {
        console.error("Error creating couple:", error);
        toast.error(`Errore durante la creazione della coppia: ${error.message}`);
      });
  };

  const joinCouple = async (coupleId: string) => {
    try {
      const coupleDoc = await getDoc(doc(db, 'couples', coupleId));
      
      if (coupleDoc.exists()) {
        // Update user with coupleId
        if (user) {
          const updatedUser: User = { ...user, coupleId: coupleId };
          await setDoc(doc(db, 'users', user.id), updatedUser);
          setUser(updatedUser);
          setCouple(coupleDoc.data() as Couple);
          toast.success('Coppia aggiunta con successo!');
        }
      } else {
        toast.error('ID coppia non trovato.');
      }
    } catch (error: any) {
      console.error("Error joining couple:", error);
      toast.error(`Errore durante l'aggiunta alla coppia: ${error.message}`);
    }
  };

  const leaveCouple = async () => {
    try {
      if (user) {
        const updatedUser: User = { ...user, coupleId: undefined };
        await setDoc(doc(db, 'users', user.id), updatedUser);
        setUser(updatedUser);
        setCouple(null);
        toast.success('Coppia lasciata con successo!');
      }
    } catch (error: any) {
      console.error("Error leaving couple:", error);
      toast.error(`Errore durante l'uscita dalla coppia: ${error.message}`);
    }
  };

  const value = {
    user,
    couple,
    loading,
    signUp,
    signIn,
    signOut,
    updateUser,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    createCouple,
    joinCouple,
    leaveCouple,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
