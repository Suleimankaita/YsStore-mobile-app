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
import { router } from 'expo-router';
import { useLoginCompanyUsersMutation } from '@/Features/api/UserSlice';
const StaffLoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    staffId: '',
    password: '',
  });

  const [loginStaff, { isLoading,isSuccess,error }] = useLoginCompanyUsersMutation();

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = async() => {
    try{

      const users=await loginStaff({Username:form?.staffId, Password:form?.password}).unwrap();
      console.log(users);
    }catch(err){
      alert(err?.message||err?.data?.message||'An error occurred during login. Please try again.');
    }
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
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <Text style={styles.badge}>STAFF PORTAL</Text>
            <Text style={styles.title}>Staff Login</Text>
            <Text style={styles.subtitle}>
              Sign in to access sales tools, assigned operations and internal store features.
            </Text>

            <View style={styles.highlightCard}>
              <Text style={styles.highlightTitle}>Note</Text>
              <Text style={styles.highlightText}>
                Staff accounts are created by the admin. Contact your administrator if you do not have access.
              </Text>
            </View>

            <View style={styles.formCard}>
              <AuthInput
                label="Staff ID / Username / Email"
                value={form.staffId}
                onChangeText={(text) => updateField('staffId', text)}
                placeholder="Enter staff ID, username or email"
              />

              <AuthInput
                label="Password"
                value={form.password}
                onChangeText={(text) => updateField('password', text)}
                placeholder="Enter your password"
                secureTextEntry
              />

              <PrimaryButton title="Login to Staff Portal" onPress={handleLogin} />
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
    backgroundColor: '#0C0F15',
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
    color: '#6FE7C8',
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
    marginBottom: 18,
  },
  highlightCard: {
    backgroundColor: 'rgba(111,231,200,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(111,231,200,0.18)',
    padding: 16,
    borderRadius: 20,
    marginBottom: 18,
  },
  highlightTitle: {
    color: '#6FE7C8',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  highlightText: {
    color: '#D7F7EF',
    fontSize: 13,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
});

export default StaffLoginScreen;