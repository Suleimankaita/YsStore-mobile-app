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

const UserLoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    emailOrPhone: '',
    password: '',
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = () => {
    console.log('User login', form);
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

            <Text style={styles.badge}>CUSTOMER LOGIN</Text>
            <Text style={styles.title}>Welcome to YSStore</Text>
            <Text style={styles.subtitle}>
              Sign in to continue shopping, track orders and manage your account.
            </Text>

            <View style={styles.formCard}>
              <AuthInput
                label="Email or Phone"
                value={form.emailOrPhone}
                onChangeText={(text) => updateField('emailOrPhone', text)}
                placeholder="Enter your email or phone number"
                keyboardType="default"
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

              <PrimaryButton title="Login" onPress={handleLogin} style={styles.loginBtn} />
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Don’t have an account?</Text>
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
    backgroundColor: '#0D1017',
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
    color: '#8C92FF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
  },
  subtitle: {
    color: '#97A1B3',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 24,
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
    color: '#A5AEFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loginBtn: {
    marginTop: 6,
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
    color: '#8C92FF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default UserLoginScreen;