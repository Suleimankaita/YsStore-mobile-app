import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { router } from 'expo-router';
import { useAuthRegsMutation } from '@/Features/api/UserSlice';
import * as location from "expo-location";

const SKY = 'skyblue';
const TOMATO = 'tomato';

const AdminLoginScreen = ({ localStorages = {} }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [UserRegs,{isLoading,isSuccess,error,isError}]=useAuthRegsMutation()
  const initialRegisterForm = useMemo(
    () => ({
      username: localStorages?.username || '',
      password: localStorages?.password || '',
      confirmPassword: '',
      firstname: localStorages?.firstname || '',
      lastname: localStorages?.lastname || '',
      email: localStorages?.email || '',
      phone: localStorages?.phone || '',
      adminState: localStorages?.adminState || '',
      adminLga: localStorages?.adminLga || '',
      adminStreet: localStorages?.adminStreet || '',
      adminPostal: localStorages?.adminPostal || '',
      companyName: localStorages?.companyName || '',
      adminId: localStorages?.adminId || 'ADM-' + Math.floor(1000 + Math.random() * 9000),
      companyState: localStorages?.companyState || '',
      companyLga: localStorages?.companyLga || '',
      companyStreet: localStorages?.companyStreet || '',
      companyPostal: localStorages?.companyPostal || '',
      lat: localStorages?.lat || '',
      long: localStorages?.long || '',
    }),
    [localStorages]
  );

  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(1);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState(initialRegisterForm);

  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [lgaModalVisible, setLgaModalVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState('admin');
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

  const selectedAdminStateObj = useMemo(() => {
    return allStates.find((item) => {
      const name = item?.name || item?.state || '';
      return name.toLowerCase() === String(registerForm.adminState).toLowerCase();
    });
  }, [allStates, registerForm.adminState]);

  const selectedCompanyStateObj = useMemo(() => {
    return allStates.find((item) => {
      const name = item?.name || item?.state || '';
      return name.toLowerCase() === String(registerForm.companyState).toLowerCase();
    });
  }, [allStates, registerForm.companyState]);

  const activeStateObj = pickerTarget === 'admin' ? selectedAdminStateObj : selectedCompanyStateObj;

  const lgaList = useMemo(() => {
    try {
      if (!activeStateObj) return [];
      const stateId =
        activeStateObj?.id ||
        activeStateObj?.slug ||
        activeStateObj?.name?.toLowerCase();
      return getLGAsByState(stateId) || [];
    } catch (error) {
      console.log('Failed to load lgas:', error);
      return [];
    }
  }, [activeStateObj]);


  useEffect(() => {
      (async () => {
        let { status } = await location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return alert('Permission to access location was denied');
        const {coords}=await location.getCurrentPositionAsync({
          accuracy: location.Accuracy.Highest,
        });
  
        const {latitude,longitude}=coords;
        setRegisterForm((prev)=>({...prev,lat:latitude,long:longitude}))
        
          })();
    }, [])
  

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
    if (!registerForm.adminState && registerForm.adminLga) {
      setRegisterForm((prev) => ({ ...prev, adminLga: '' }));
    }
  }, [registerForm.adminState, registerForm.adminLga]);

  useEffect(() => {
    if (!registerForm.companyState && registerForm.companyLga) {
      setRegisterForm((prev) => ({ ...prev, companyLga: '' }));
    }
  }, [registerForm.companyState, registerForm.companyLga]);

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

  const updateLoginField = (key, value) => {
    setLoginForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateRegisterField = (key, value) => {
    setRegisterForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = () => {
    console.log('Admin login', loginForm);
  };

  const handleRegister = async() => {
    try{
      const payload = {
          Username: registerForm?.username,
          Password: registerForm?.password,
          Firstname: registerForm?.firstname,
          Lastname: registerForm?.lastname,
          // StreetName: registerForm?.,
          PostalNumber: registerForm?.adminPostal,
          Lat: registerForm?.lat,
          Long: registerForm?.long,
          Email: registerForm?.email,
        };
        const complete=await UserRegs(payload).unwrap()

        console.log(complete)
    }catch(err){
      alert(err?.message||err?.data?.message)
    }
  };

  const nextStep = () => {
    if (step < 4) {
      animateStep(1, () => setStep((prev) => prev + 1));
    }
  };

  const prevStep = () => {
    if (step > 1) {
      animateStep(-1, () => setStep((prev) => prev - 1));
    }
  };

  const switchMode = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'register') {
      setStep(1);
    }
  };

  const openStateModal = (target) => {
    setPickerTarget(target);
    setStateSearch('');
    setStateModalVisible(true);
  };

  const openLgaModal = (target) => {
    const stateValue = target === 'admin' ? registerForm.adminState : registerForm.companyState;
    if (!stateValue) return;
    setPickerTarget(target);
    setLgaSearch('');
    setLgaModalVisible(true);
  };

  const selectState = (item) => {
    const name = item?.name || item?.state || '';
    if (pickerTarget === 'admin') {
      setRegisterForm((prev) => ({
        ...prev,
        adminState: name,
        adminLga: '',
      }));
    } else {
      setRegisterForm((prev) => ({
        ...prev,
        companyState: name,
        companyLga: '',
      }));
    }
    setStateModalVisible(false);
  };

  const selectLga = (item) => {
    const name =
      typeof item === 'string'
        ? item
        : item?.name || item?.lga || item?.id || '';

    if (pickerTarget === 'admin') {
      setRegisterForm((prev) => ({
        ...prev,
        adminLga: name,
      }));
    } else {
      setRegisterForm((prev) => ({
        ...prev,
        companyLga: name,
      }));
    }
    setLgaModalVisible(false);
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

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <AuthInput
              label="Username"
              value={registerForm.username}
              onChangeText={(text) => updateRegisterField('username', text)}
              placeholder="Enter username"
              autoCapitalize="none"
            />

            <AuthInput
              label="First Name"
              value={registerForm.firstname}
              onChangeText={(text) => updateRegisterField('firstname', text)}
              placeholder="Enter first name"
            />

            <AuthInput
              label="Last Name"
              value={registerForm.lastname}
              onChangeText={(text) => updateRegisterField('lastname', text)}
              placeholder="Enter last name"
            />

            <AuthInput
              label="Email"
              value={registerForm.email}
              onChangeText={(text) => updateRegisterField('email', text)}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AuthInput
              label="Phone"
              value={registerForm.phone}
              onChangeText={(text) => updateRegisterField('phone', text)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <View style={styles.idCard}>
              <Text style={styles.idLabel}>Generated Admin ID</Text>
              <Text style={styles.idValue}>{registerForm.adminId}</Text>
            </View>
          </>
        );

      case 2:
        return (
          <>
            <AuthInput
              label="Password"
              value={registerForm.password}
              onChangeText={(text) => updateRegisterField('password', text)}
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

            <Pressable style={styles.selectBox} onPress={() => openStateModal('admin')}>
              <Text style={styles.selectLabel}>Admin State</Text>
              <Text
                style={[
                  styles.selectValue,
                  !registerForm.adminState && styles.placeholderText,
                ]}
              >
                {registerForm.adminState || 'Choose admin state'}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.selectBox,
                !registerForm.adminState && styles.selectBoxDisabled,
              ]}
              onPress={() => openLgaModal('admin')}
            >
              <Text style={styles.selectLabel}>Admin LGA</Text>
              <Text
                style={[
                  styles.selectValue,
                  !registerForm.adminLga && styles.placeholderText,
                ]}
              >
                {registerForm.adminLga ||
                  (registerForm.adminState ? 'Choose admin LGA' : 'Select state first')}
              </Text>
            </Pressable>

            <AuthInput
              label="Admin Street"
              value={registerForm.adminStreet}
              onChangeText={(text) => updateRegisterField('adminStreet', text)}
              placeholder="Enter admin street"
            />

            <AuthInput
              label="Admin Postal"
              value={registerForm.adminPostal}
              onChangeText={(text) => updateRegisterField('adminPostal', text)}
              placeholder="Enter admin postal code"
              keyboardType="number-pad"
            />
          </>
        );

      case 3:
        return (
          <>
            <AuthInput
              label="Company Name"
              value={registerForm.companyName}
              onChangeText={(text) => updateRegisterField('companyName', text)}
              placeholder="Enter company name"
            />

            <Pressable style={styles.selectBox} onPress={() => openStateModal('company')}>
              <Text style={styles.selectLabel}>Company State</Text>
              <Text
                style={[
                  styles.selectValue,
                  !registerForm.companyState && styles.placeholderText,
                ]}
              >
                {registerForm.companyState || 'Choose company state'}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.selectBox,
                !registerForm.companyState && styles.selectBoxDisabled,
              ]}
              onPress={() => openLgaModal('company')}
            >
              <Text style={styles.selectLabel}>Company LGA</Text>
              <Text
                style={[
                  styles.selectValue,
                  !registerForm.companyLga && styles.placeholderText,
                ]}
              >
                {registerForm.companyLga ||
                  (registerForm.companyState ? 'Choose company LGA' : 'Select state first')}
              </Text>
            </Pressable>

            <AuthInput
              label="Company Street"
              value={registerForm.companyStreet}
              onChangeText={(text) => updateRegisterField('companyStreet', text)}
              placeholder="Enter company street"
            />

            <AuthInput
              label="Company Postal"
              value={registerForm.companyPostal}
              onChangeText={(text) => updateRegisterField('companyPostal', text)}
              placeholder="Enter company postal code"
              keyboardType="number-pad"
            />
          </>
        );

      case 4:
        return (
          <>
            <AuthInput
              label="Latitude"
              readOnly={true}
              value={String(registerForm.lat)}
              onChangeText={(text) => updateRegisterField('lat', text)}
              placeholder="Enter latitude"
              keyboardType="numeric"
            />

            <AuthInput
              label="Longitude"
              readOnly={true}
              value={String(registerForm.long)}
              onChangeText={(text) => updateRegisterField('long', text)}
              placeholder="Enter longitude"
              keyboardType="numeric"
            />

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Registration Summary</Text>
              <Text style={styles.summaryText}>
                Admin: {registerForm.firstname} {registerForm.lastname}
              </Text>
              <Text style={styles.summaryText}>Username: {registerForm.username}</Text>
              <Text style={styles.summaryText}>Email: {registerForm.email}</Text>
              <Text style={styles.summaryText}>Phone: {registerForm.phone}</Text>
              <Text style={styles.summaryText}>
                Admin Address: {registerForm.adminStreet}, {registerForm.adminLga}, {registerForm.adminState}
              </Text>
              <Text style={styles.summaryText}>
                Company: {registerForm.companyName}
              </Text>
              <Text style={styles.summaryText}>
                Company Address: {registerForm.companyStreet}, {registerForm.companyLga}, {registerForm.companyState}
              </Text>
              <Text style={styles.summaryText}>Admin ID: {registerForm.adminId}</Text>
            </View>
          </>
        );

      default:
        return null;
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
            <View style={styles.glowOne} />
            <View style={styles.glowTwo} />

            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <Text style={styles.badge}>ADMIN ACCESS</Text>
            <Text style={styles.title}>
              {mode === 'login' ? 'Manage your business' : 'Create business account'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Log in to control your company, staff, products, branches, reports and analytics.'
                : 'Register your admin account and set up your business in a cleaner multi-step flow.'}
            </Text>

            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>
                {mode === 'login' ? 'Business Control Center' : 'Admin Onboarding'}
              </Text>
              <Text style={styles.heroText}>
                {mode === 'login'
                  ? 'Secure admin-only access for operations, inventory, sales and decision-making.'
                  : 'Select admin and company state/LGA, complete registration and create your business account.'}
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
                    label="Admin Email"
                    value={loginForm.email}
                    onChangeText={(text) => updateLoginField('email', text)}
                    placeholder="Enter your admin email"
                    keyboardType="email-address"
                    autoCapitalize="none"
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

                  <PrimaryButton title="Login as Admin" onPress={handleLogin} />
                </>
              ) : (
                <>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>Step {step} of 4</Text>
                    <Text style={styles.progressSubText}>
                      {step === 1 && 'Basic Admin Details'}
                      {step === 2 && 'Security & Admin Address'}
                      {step === 3 && 'Company Address Details'}
                      {step === 4 && 'Location & Review'}
                    </Text>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
                  </View>

                  <Animated.View
                    style={{
                      transform: [{ translateX: slideAnim }],
                    }}
                  >
                    {renderStepContent()}
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

                    {step < 4 ? (
                      <View style={{ flex: 1 }}>
                        <PrimaryButton title="Next Step" onPress={nextStep} />
                      </View>
                    ) : (
                      <View style={{ flex: 1 }}>
                        <PrimaryButton title="Create Admin Account" onPress={handleRegister} />
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>
                {mode === 'login' ? 'Need a business account?' : 'Already have an account?'}
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
              <Text style={styles.modalTitle}>
                Select {pickerTarget === 'admin' ? 'Admin' : 'Company'} State
              </Text>
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
              <Text style={styles.modalTitle}>
                Select {pickerTarget === 'admin' ? 'Admin' : 'Company'} LGA
              </Text>
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
  idCard: {
    marginTop: 2,
    marginBottom: 6,
    borderRadius: 18,
    padding: 15,
    backgroundColor: 'rgba(135,206,235,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(135,206,235,0.20)',
  },
  idLabel: {
    color: SKY,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  idValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
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

export default AdminLoginScreen;