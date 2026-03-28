import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/store/auth-store';

interface Company {
  company__slug: string;
  company__name: string;
  company__logo: string;
}

export default function LoginCompanySelectionScreen() {
  const { email, companies: companiesParam } = useLocalSearchParams();
  const { baseUrl } = useAuth();
  
  const companies: Company[] = companiesParam ? JSON.parse(companiesParam as string) : [];

  const handleCompanySelect = (company: Company) => {
    router.push({
      pathname: '/login-password',
      params: {
        email,
        companySlug: company.company__slug,
        companyName: company.company__name,
        companyLogo: company.company__logo,
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  const getLogoUrl = (logoPath: string) => {
    if (logoPath.startsWith('http')) {
      return logoPath;
    }
    return `${baseUrl}/${logoPath}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} testID="back-button">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Sélectionnez votre société</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Choisissez la société avec laquelle vous souhaitez vous connecter
        </Text>

        <View style={styles.companiesList}>
          {companies.map((company, index) => (
            <TouchableOpacity
              key={company.company__slug}
              style={styles.companyCard}
              onPress={() => handleCompanySelect(company)}
              testID={`company-${index}`}
            >
              <View style={styles.companyContent}>
                <View style={styles.logoContainer}>
                  <Image
                    source={{ uri: getLogoUrl(company.company__logo) }}
                    style={styles.logo}
                    defaultSource={require('@/assets/images/icon.png')}
                  />
                </View>
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{company.company__name}</Text>
                  <Text style={styles.companySlug}>{company.company__slug}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
    lineHeight: 24,
  },
  companiesList: {
    gap: 16,
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  companyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  companySlug: {
    fontSize: 14,
    color: '#6B7280',
  },
});