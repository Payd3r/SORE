
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const signInSchema = z.object({
  email: z.string().email({ message: 'Email non valida' }),
  password: z.string().min(6, {
    message: 'La password deve contenere almeno 6 caratteri',
  }),
});

const signUpSchema = z.object({
  name: z.string().min(2, {
    message: 'Il nome deve contenere almeno 2 caratteri',
  }),
  email: z.string().email({ message: 'Email non valida' }),
  password: z.string().min(6, {
    message: 'La password deve contenere almeno 6 caratteri',
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Le password non corrispondono',
  path: ['confirmPassword'],
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

export const AuthForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formType, setFormType] = useState<'signIn' | 'signUp'>('signIn');
  const { signIn, signUp } = useAuth();

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSignInSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Accesso effettuato con successo!');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Credenziali non valide. Per la demo usa email: demo@example.com e password: password');
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUpSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.name);
      toast.success('Registrazione completata con successo!');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Errore durante la registrazione');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card shadow-lg rounded-xl animate-fade-in">
      <Tabs defaultValue="signIn" onValueChange={(value) => setFormType(value as 'signIn' | 'signUp')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="signIn">Accedi</TabsTrigger>
          <TabsTrigger value="signUp">Registrati</TabsTrigger>
        </TabsList>

        <TabsContent value="signIn" className="space-y-4">
          <h1 className="text-2xl font-bold text-center">Bentornato</h1>
          <p className="text-muted-foreground text-center mb-4">
            Inserisci le tue credenziali per accedere
          </p>

          <Form {...signInForm}>
            <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-4">
              <FormField
                control={signInForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="nome@esempio.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signInForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Accedi
              </Button>
            </form>
          </Form>
          
          <p className="text-center text-sm text-muted-foreground">
            Per la demo, usa: <br />
            <strong>Email:</strong> demo@example.com <br />
            <strong>Password:</strong> password
          </p>
        </TabsContent>

        <TabsContent value="signUp" className="space-y-4">
          <h1 className="text-2xl font-bold text-center">Crea un Account</h1>
          <p className="text-muted-foreground text-center mb-4">
            Inserisci i tuoi dati per registrarti
          </p>

          <Form {...signUpForm}>
            <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
              <FormField
                control={signUpForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Il tuo nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signUpForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="nome@esempio.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signUpForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signUpForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conferma Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrati
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};
