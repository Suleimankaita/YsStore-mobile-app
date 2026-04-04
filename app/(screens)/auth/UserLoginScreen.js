import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getStates, getLGAsByState } from '@some19ice/nigeria-geo-core';
import AuthInput from '@/components/AuthInputs';
import PrimaryButton from '@/components/PrimaryButton';
import ScreenFadeWrapper from '@/components/ui/screenwrapper';
import { useAuthRegsMutation,useUsersLoginMutation } from '@/Features/api/UserSlice';
import { Trophy } from 'lucide-react-native';
import * as location from "expo-location";

const SKY = 'skyblue';
const TOMATO = 'tomato';

const UserLoginScreen = ({ navigation }) => {
   const [UserRegs,{isLoading,isSuccess,error,isError}]=useAuthRegsMutation()
  const [UsersLogin,{isLoading:IsLoading, isSuccess: IsSuccess, error: Error, isError: IsError}]=useUsersLoginMutation()
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(1);

  const [loginForm, setLoginForm] = useState({
    emailOrPhone: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    Firstname: '',
    Lastname: '',
    Username: '',
    Email: '',
    phone: '',
    Password: '',
    confirmPassword: '',
    State: '',
    Lga: '',
    StreetName: '',
    PostalNumber: '',
    Lat: 6.5244,
    Long: 3.3792,
  });

  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [lgaModalVisible, setLgaModalVisible] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [lgaSearch, setLgaSearch] = useState('');

  const allStates = useMemo(() => {
    try {
      return getStates() || [];
    } catch (error) {
      console.log('Failed to load states:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return alert('Permission to access location was denied');
      const {coords}=await location.getCurrentPositionAsync({
        accuracy: location.Accuracy.Highest,
      });

      const {latitude,longitude}=coords;
      setRegisterForm((prev)=>({...prev,Lat:latitude,Long:longitude}))
      
        })();
  }, [])

  const selectedStateObj = useMemo(() => {
    return allStates.find((item) => {
      const name = item?.name || item?.state || '';
      return name.toLowerCase() === String(registerForm.State).toLowerCase();
    });
  }, [allStates, registerForm.State]);

  const lgaList = useMemo(() => {
    try {
      if (!selectedStateObj) return [];
      const stateId =
        selectedStateObj?.id ||
        selectedStateObj?.slug ||
        selectedStateObj?.name?.toLowerCase();
      return getLGAsByState(stateId) || [];
    } catch (error) {
      console.log('Failed to load lgas:', error);
      return [];
    }
  }, [selectedStateObj]);

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return allStates;
    return allStates.filter((item) => {
      const name = item?.name || item?.state || '';
      return name.toLowerCase().includes(stateSearch.toLowerCase());
    });
  }, [allStates, stateSearch]);

  const filteredLgas = useMemo(() => {
    if (!lgaSearch.trim()) return lgaList;
    return lgaList.filter((item) => {
      const name =
        typeof item === 'string'
          ? item
          : item?.name || item?.lga || item?.id || '';
      return name.toLowerCase().includes(lgaSearch.toLowerCase());
    });
  }, [lgaList, lgaSearch]);

  useEffect(() => {
    if (!registerForm.State) {
      setRegisterForm((prev) => ({ ...prev, Lga: '' }));
    }
  }, [registerForm.State]);

  const updateLoginField = (key, value) => {
    setLoginForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateRegisterField = (key, value) => {
    setRegisterForm((prev) => ({ ...prev, [key]: value }));
  };

  const animateStep = (direction = 1, cb) => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 24 * direction,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => cb?.());
  };

  const nextStep = () => {
    if (step < 3) {
      animateStep(1, () => setStep((prev) => prev + 1));
    }
  };

  const prevStep = () => {
    if (step > 1) {
      animateStep(-1, () => setStep((prev) => prev - 1));
    }
  };

  const handleLogin = useCallback(async() => {
    try{
      const payload = {
        Username:registerForm?.Username,
        Password:registerForm?.Password,
      }
      const logins=await UsersLogin(payload).unwrap()
      console.log('logins',logins)

    }catch(error){
      alert(error?.message||error?.data?.message);
    }
  },[registerForm.Username, registerForm.Password,UsersLogin ]);

  useEffect(()=>{
    if(isSuccess){
      handleLogin();
    }
  },[isSuccess,handleLogin])
  

  const handleRegister = async() => {
  try{
      if (registerForm.Password !== registerForm.confirmPassword) return ;
      const payload = {
        Username: registerForm?.Username,
        Password: registerForm?.Password,
        Firstname: registerForm?.Firstname,
        Lastname: registerForm?.Lastname,
        // StreetName: registerForm?.,
        PostalNumber: registerForm?.PostalNumber,
        Lat: registerForm?.Lat,
        Long: registerForm?.Long,
        Email: registerForm?.Email,
      };
      const complete=await UserRegs(payload).unwrap()

      
      console.log(complete)
    }catch(error){
      alert(error?.message||error?.data?.message);
    }
  };

  const switchMode = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'register') {
      setStep(1);
    }
  };

  const openStateModal = () => {
    setStateSearch('');
    setStateModalVisible(true);
  };

  const openLgaModal = () => {
    if (!registerForm.State) return;
    setLgaSearch('');
    setLgaModalVisible(true);
  };

  const selectState = (item) => {
    const name = item?.name || item?.state || '';
    updateRegisterField('State', name);
    updateRegisterField('Lga', '');
    setStateModalVisible(false);
  };

  const selectLga = (item) => {
    const name =
      typeof item === 'string'
        ? item
        : item?.name || item?.lga || item?.id || '';
    updateRegisterField('Lga', name);
    setLgaModalVisible(false);
  };

  const renderRegisterStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <AuthInput
              label="First Name"
              value={registerForm.Firstname}
              onChangeText={(text) => updateRegisterField('Firstname', text)}
              placeholder="Enter your first name"
            />

            <AuthInput
              label="Last Name"
              value={registerForm.Lastname}
              onChangeText={(text) => updateRegisterField('Lastname', text)}
              placeholder="Enter your last name"
            />

            <AuthInput
              label="Username"
              value={registerForm.Username}
              onChangeText={(text) => updateRegisterField('Username', text)}
              placeholder="Choose a username"
              autoCapitalize="none"
            />

            <AuthInput
              label="Email"
              value={registerForm.Email}
              onChangeText={(text) => updateRegisterField('Email', text)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AuthInput
              label="Phone Number"
              value={registerForm.phone}
              onChangeText={(text) => updateRegisterField('phone', text)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </>
        );

      case 2:
        return (
          <>
            <AuthInput
              label="Password"
              value={registerForm.Password}
              onChangeText={(text) => updateRegisterField('Password', text)}
              placeholder="Create password"
              secureTextEntry
            />

            <AuthInput
              label="Confirm Password"
              value={registerForm.confirmPassword}
              onChangeText={(text) => updateRegisterField('confirmPassword', text)}
              placeholder="Confirm password"
              secureTextEntry
            />

            <Pressable style={styles.selectBox} onPress={openStateModal}>
              <Text style={styles.selectLabel}>State</Text>
              <Text
                style={[
                  styles.selectValue,
                  !registerForm.State && styles.placeholderText,
                ]}
              >
                {registerForm.State || 'Choose your state'}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.selectBox,
                !registerForm.State && styles.selectBoxDisabled,
              ]}
              onPress={openLgaModal}
            >
              <Text style={styles.selectLabel}>LGA</Text>
              <Text
                style={[
                  styles.selectValue,
                  !registerForm.Lga && styles.placeholderText,
                ]}
              >
                {registerForm.Lga ||
                  (registerForm.State
                    ? 'Choose your LGA'
                    : 'Select state first')}
              </Text>
            </Pressable>
          </>
        );

      case 3:
        return (
          <>
            <AuthInput
              label="Street Name"
              value={registerForm.StreetName}
              onChangeText={(text) => updateRegisterField('StreetName', text)}
              placeholder="Enter your street name"
            />

            <AuthInput
              label="Postal Number"
              value={registerForm.PostalNumber}
              onChangeText={(text) => updateRegisterField('PostalNumber', text)}
              placeholder="Enter postal number"
              keyboardType="number-pad"
            />

            <AuthInput
              label="Latitude"
              readOnly={true}
              value={String(registerForm.Lat)}
              onChangeText={(text) => updateRegisterField('Lat', text)}
              placeholder="Latitude"
              keyboardType="numeric"
            />

            <AuthInput
              label="Longitude"
              readOnly={true}
              value={String(registerForm.Long)}
              onChangeText={(text) => updateRegisterField('Long', text)}
              placeholder="Longitude"
              keyboardType="numeric"
            />

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Preview</Text>
              <Text style={styles.summaryText}>
                Name: {registerForm.Firstname} {registerForm.Lastname}
              </Text>
              <Text style={styles.summaryText}>
                Username: {registerForm.Username}
              </Text>
              <Text style={styles.summaryText}>Email: {registerForm.Email}</Text>
              <Text style={styles.summaryText}>Phone: {registerForm.phone}</Text>
              <Text style={styles.summaryText}>
                State / LGA: {registerForm.State} / {registerForm.Lga}
              </Text>
              <Text style={styles.summaryText}>
                Address: {registerForm.StreetName}, {registerForm.PostalNumber}
              </Text>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  const renderPickerItem = ({ item, type }) => {
    const label =
      type === 'state'
        ? item?.name || item?.state || ''
        : typeof item === 'string'
        ? item
        : item?.name || item?.lga || item?.id || '';

    return (
      <Pressable
        style={styles.modalItem}
        onPress={() => (type === 'state' ? selectState(item) : selectLga(item))}
      >
        <Text style={styles.modalItemText}>{label}</Text>
      </Pressable>
    );
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
            <View style={styles.glowOne} />
            <View style={styles.glowTwo} />

            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <Text style={styles.badge}>CUSTOMER ACCESS</Text>
            <Text style={styles.title}>
              {mode === 'login' ? 'Welcome to YSStore' : 'Create your account'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Sign in to continue shopping, track orders and manage your account.'
                : 'Create your customer account with a smoother and cleaner registration flow.'}
            </Text>

            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>
                {mode === 'login' ? 'Fast Secure Shopping' : 'Easy Customer Onboarding'}
              </Text>
              <Text style={styles.heroText}>
                {mode === 'login'
                  ? 'Access orders, profile, saved items and purchase history securely.'
                  : 'Choose your state and LGA, add your address and finish registration in a few steps.'}
              </Text>
            </View>

            <View style={styles.tabContainer}>
              <Pressable
                onPress={() => switchMode('login')}
                style={[styles.tabButton, mode === 'login' && styles.activeLoginTab]}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
                  Login
                </Text>
              </Pressable>

              <Pressable
                onPress={() => switchMode('register')}
                style={[styles.tabButton, mode === 'register' && styles.activeRegisterTab]}
              >
                <Text style={[styles.tabText, mode === 'register' && styles.activeTabTextDark]}>
                  Register
                </Text>
              </Pressable>
            </View>

            <View style={styles.formCard}>
              {mode === 'login' ? (
                <>
                  <AuthInput
                    label="Email or Phone"
                    value={loginForm.emailOrPhone}
                    onChangeText={(text) => updateLoginField('emailOrPhone', text)}
                    placeholder="Enter your email or phone number"
                    keyboardType="default"
                  />

                  <AuthInput
                    label="Password"
                    value={loginForm.password}
                    onChangeText={(text) => updateLoginField('password', text)}
                    placeholder="Enter your password"
                    secureTextEntry
                  />

                  <Pressable style={styles.linkWrap}>
                    <Text style={styles.linkText}>Forgot Password?</Text>
                  </Pressable>

                  <PrimaryButton title="Login" onPress={handleLogin} style={styles.loginBtn} />
                </>
              ) : (
                <>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>Step {step} of 3</Text>
                    <Text style={styles.progressSubText}>
                      {step === 1 && 'Personal Details'}
                      {step === 2 && 'Security & Location'}
                      {step === 3 && 'Address & Review'}
                    </Text>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${(step / 3) * 100}%` },
                      ]}
                    />
                  </View>

                  <Animated.View
                    style={{
                      transform: [{ translateX: slideAnim }],
                    }}
                  >
                    {renderRegisterStep()}
                  </Animated.View>

                  <View style={styles.paginationRow}>
                    {step > 1 ? (
                      <Pressable onPress={prevStep} style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>Previous</Text>
                      </Pressable>
                    ) : (
                      <View style={{ flex: 1 }} />
                    )}

                    <View style={{ width: 12 }} />

                    {step < 3 ? (
                      <View style={{ flex: 1 }}>
                        <PrimaryButton title="Next Step" onPress={nextStep} />
                      </View>
                    ) : (
                      <View style={{ flex: 1 }}>
                        <PrimaryButton title="Create Account" onPress={handleRegister} />
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>
                {mode === 'login' ? 'Don’t have an account?' : 'Already have an account?'}
              </Text>
              <Pressable onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}>
                <Text style={styles.bottomLink}>
                  {mode === 'login' ? ' Register' : ' Login'}
                </Text>
              </Pressable>
            </View>
          </ScreenFadeWrapper>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={stateModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setStateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <Pressable onPress={() => setStateModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <TextInput
              value={stateSearch}
              onChangeText={setStateSearch}
              placeholder="Search state..."
              placeholderTextColor="#8A96A8"
              style={styles.searchInput}
            />

            <FlatList
              data={filteredStates}
              keyExtractor={(item, index) =>
                String(item?.id || item?.slug || item?.name || index)
              }
              renderItem={({ item }) => renderPickerItem({ item, type: 'state' })}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={lgaModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLgaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select LGA</Text>
              <Pressable onPress={() => setLgaModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <TextInput
              value={lgaSearch}
              onChangeText={setLgaSearch}
              placeholder="Search LGA..."
              placeholderTextColor="#8A96A8"
              style={styles.searchInput}
            />

            <FlatList
              data={filteredLgas}
              keyExtractor={(item, index) =>
                String(
                  typeof item === 'string'
                    ? `${item}-${index}`
                    : item?.id || item?.name || item?.lga || index
                )
              }
              renderItem={({ item }) => renderPickerItem({ item, type: 'lga' })}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No LGA found</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    position: 'relative',
  },
  glowOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(135,206,235,0.14)',
    top: -30,
    right: -40,
  },
  glowTwo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(255,99,71,0.10)',
    bottom: 20,
    left: -70,
  },
  backButton: {
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#C9D4E2',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    color: SKY,
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
    color: '#AAB6C7',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 18,
  },
  heroCard: {
    padding: 18,
    borderRadius: 24,
    marginBottom: 18,
    backgroundColor: 'rgba(135,206,235,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(135,206,235,0.25)',
  },
  heroTitle: {
    color: SKY,
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 6,
  },
  heroText: {
    color: '#EAF7FF',
    lineHeight: 20,
    fontSize: 13,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  activeLoginTab: {
    backgroundColor: SKY,
  },
  activeRegisterTab: {
    backgroundColor: TOMATO,
  },
  tabText: {
    color: '#D0D7E3',
    fontWeight: '700',
    fontSize: 14,
  },
  activeTabText: {
    color: '#0B1220',
    fontWeight: '900',
  },
  activeTabTextDark: {
    color: '#FFFFFF',
    fontWeight: '900',
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
    color: TOMATO,
    fontSize: 13,
    fontWeight: '700',
  },
  loginBtn: {
    marginTop: 6,
  },
  progressHeader: {
    marginBottom: 12,
  },
  progressText: {
    color: TOMATO,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  progressSubText: {
    color: '#DDE5F0',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: TOMATO,
    borderRadius: 999,
  },
  selectBox: {
    minHeight: 58,
    borderWidth: 1.2,
    borderColor: 'rgba(135,206,235,0.30)',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  selectBoxDisabled: {
    opacity: 0.55,
  },
  selectLabel: {
    color: SKY,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  selectValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#8DA0B8',
    fontWeight: '500',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(135,206,235,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(135,206,235,0.08)',
  },
  secondaryButtonText: {
    color: SKY,
    fontWeight: '800',
    fontSize: 14,
  },
  summaryCard: {
    marginTop: 8,
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(255,99,71,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,99,71,0.20)',
  },
  summaryTitle: {
    color: TOMATO,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },
  summaryText: {
    color: '#FFF1EE',
    fontSize: 13,
    marginBottom: 6,
  },
  bottomRow: {
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  bottomText: {
    color: '#AAB6C7',
    fontSize: 14,
  },
  bottomLink: {
    color: SKY,
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4,10,20,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '78%',
    backgroundColor: '#111A2C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    borderTopWidth: 1,
    borderColor: 'rgba(135,206,235,0.20)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  closeText: {
    color: TOMATO,
    fontWeight: '800',
    fontSize: 14,
  },
  searchInput: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(135,206,235,0.22)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  modalItemText: {
    color: '#EEF6FF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    color: '#9FB0C6',
    textAlign: 'center',
    marginTop: 22,
    fontSize: 14,
  },
});

export default UserLoginScreen;