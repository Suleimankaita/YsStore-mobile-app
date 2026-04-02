import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AuthInput from '@/components/AuthInputs';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenFadeWrapper from '@/components/ui/screenwrapper';

const AdminLoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = () => {
    console.log('Admin login', form);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenFadeWrapper style={styles.container}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <Text style={styles.badge}>ADMIN ACCESS</Text>
            <Text style={styles.title}>Manage your business</Text>
            <Text style={styles.subtitle}>
              Log in to control your company, staff, products, branches, reports and analytics.
            </Text>

            <View style={styles.adminTopCard}>
              <Text style={styles.adminTopTitle}>Business Control Center</Text>
              <Text style={styles.adminTopText}>
                Secure admin-only access for operations, inventory, sales and decision-making.
              </Text>
            </View>

            <View style={styles.formCard}>
              <AuthInput
                label="Admin Email"
                value={form.email}
                onChangeText={(text) => updateField('email', text)}
                placeholder="Enter your admin email"
                keyboardType="email-address"
              />

              <AuthInput
                label="Password"
                value={form.password}
                onChangeText={(text) => updateField('password', text)}
                placeholder="Enter your password"
                secureTextEntry
              />

              <Pressable style={styles.linkWrap}>
                <Text style={styles.linkText}>Forgot Password?</Text>
              </Pressable>

              <PrimaryButton title="Login as Admin" onPress={handleLogin} />
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Need a business account?</Text>
              <Pressable>
                <Text style={styles.bottomLink}> Register</Text>
              </Pressable>
            </View>
          </ScreenFadeWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0D14',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {},
  backButton: {
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#B4BED1',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    color: '#F4B860',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: '#97A1B3',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 18,
  },
  adminTopCard: {
    padding: 18,
    borderRadius: 22,
    marginBottom: 18,
    backgroundColor: 'rgba(244,184,96,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(244,184,96,0.18)',
  },
  adminTopTitle: {
    color: '#F4B860',
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 6,
  },
  adminTopText: {
    color: '#FFF2DE',
    lineHeight: 20,
    fontSize: 13,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  linkWrap: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  linkText: {
    color: '#F4B860',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomRow: {
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  bottomText: {
    color: '#AAB3C5',
    fontSize: 14,
  },
  bottomLink: {
    color: '#F4B860',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default AdminLoginScreen;