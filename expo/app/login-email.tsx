import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/store/auth-store';

export default function LoginEmailScreen() {
  const { getCompaniesByEmailAction, rememberedEmail } = useAuth();
  const [email, setEmail] = useState<string>(rememberedEmail);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre adresse e-mail.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erreur', 'Veuillez saisir une adresse e-mail valide.');
      return;
    }

    setIsLoading(true);

    try {
      const companies = await getCompaniesByEmailAction(email);

      if (companies.length === 0) {
        Alert.alert(
          'Aucun compte trouvé',
          'Aucun compte associé à cet e-mail.',
          [{ text: 'Réessayer', style: 'default' }]
        );
        return;
      }

      if (companies.length === 1) {
        // Une seule société : passer directement au mot de passe
        router.push({
          pathname: '/login-password',
          params: {
            email,
            companySlug: companies[0].company__slug,
            companyName: companies[0].company__name,
            companyLogo: companies[0].company__logo,
          },
        });
      } else {
        // Plusieurs sociétés : aller à l'écran de sélection
        router.push({
          pathname: '/login-company-selection',
          params: {
            email,
            companies: JSON.stringify(companies),
          },
        });
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de vérifier l\'e-mail. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>
              Saisissez votre adresse e-mail pour continuer
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Adresse e-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Votre adresse e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              testID="email-input"
            />

            <TouchableOpacity
              style={[
                styles.button,
                (!email.trim() || !validateEmail(email) || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!email.trim() || !validateEmail(email) || isLoading}
              testID="continue-button"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Continuer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
  },
  button: {
    height: 56,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});