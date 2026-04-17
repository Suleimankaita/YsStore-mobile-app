import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  Easing,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getStates, getLGAsByState } from '@some19ice/nigeria-geo-core';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const roles = ['Customer', 'Admin', 'Staff'];

export default function YsStoreAuthScreen() {
  const [mode, setMode] = useState('Login');
  const [role, setRole] = useState('Customer');
  const [showPassword, setShowPassword] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [stateModal, setStateModal] = useState({ visible: false, target: null, title: '' });

  const [statesList] = useState(getStates());
  const [userLgas, setUserLgas] = useState([]);

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    streetName: '',
    postalNumber: '',
    lat: '',
    long: '',
    email: '',
    phone: '',
    userState: '',
    userLga: '',
    companyName: '',
    companyAddress: '',
    companyState: '',
    branchName: '',
    employeeId: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (role === 'Staff' && mode === 'Register') {
      setMode('Login');
    }
  }, [role, mode]);

  useEffect(() => {
    setRegistrationStep(1);
  }, [role, mode]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    cardScale.setValue(0.96);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mode, role, registrationStep, fadeAnim, slideAnim, cardScale]);

  useEffect(() => {
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -8,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.03,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();
    pulseLoop.start();
    glowLoop.start();

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
      glowLoop.stop();
    };
  }, [logoScale, logoFloat, buttonPulse, glowAnim]);

  useEffect(() => {
    if (!form.userState) {
      setUserLgas([]);
      return;
    }

    const stateObj = statesList.find((item) => item.name === form.userState);
    setUserLgas(stateObj ? getLGAsByState(stateObj.id) : []);
  }, [form.userState, statesList]);

  const isRegister = mode === 'Register';
  const visibleModes = role === 'Staff' ? ['Login'] : ['Login', 'Register'];
  const stateNames = statesList.map((item) => item.name);
  const canShowConfirmPassword = isRegister && role !== 'Staff';
  const passwordMatched = form.confirmPassword && form.password === form.confirmPassword;

  const title = useMemo(() => {
    if (role === 'Admin') return isRegister ? 'Register Admin & Company' : 'Admin Portal';
    if (role === 'Staff') return 'Staff Sign In';
    return isRegister ? 'Create your account' : 'Welcome back';
  }, [role, isRegister]);

  const subtitle = useMemo(() => {
    if (role === 'Admin') {
      return isRegister
        ? 'Set up the owner profile and company structure in a guided onboarding flow.'
        : 'Manage branches, inventory, reports, and staff permissions.';
    }
    if (role === 'Staff') return 'Secure login for cashiers, workers, and branch staff only.';
    return isRegister
      ? 'Create a complete customer profile with Nigerian state and local government information.'
      : 'Fast POS, smart inventory, and smooth business operations with YsStore.';
  }, [role, isRegister]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openStateModal = (target, title) => {
    setStateModal({ visible: true, target, title });
  };

  const closeStateModal = () => {
    setStateModal({ visible: false, target: null, title: '' });
  };

  const handleStatePicked = (value) => {
    if (stateModal.target === 'userState') {
      setForm((prev) => ({ ...prev, userState: value, userLga: '' }));
    }
    if (stateModal.target === 'companyState') {
      setForm((prev) => ({ ...prev, companyState: value }));
    }
    closeStateModal();
  };

  const isCustomerRegister = role === 'Customer' && isRegister;
  const isAdminRegister = role === 'Admin' && isRegister;
  const showRegistrationPager = isRegister && role !== 'Staff';
  const totalSteps = isAdminRegister ? 3 : isCustomerRegister ? 2 : 1;

  const canGoNext = () => {
    if (!isRegister) return false;
    if (isCustomerRegister) return registrationStep < 2;
    if (isAdminRegister) return registrationStep < 3;
    return false;
  };

  const canGoBack = () => isRegister && registrationStep > 1;

  const goNext = () => {
    if (canGoNext()) setRegistrationStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (canGoBack()) setRegistrationStep((prev) => prev - 1);
  };

  const renderCustomerRegisterStepOne = () => (
    <>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>Step 1 · Basic Profile</Text>
      </View>
      <Input label="Username" placeholder="Enter username" value={form.username} onChangeText={(value) => updateField('username', value)} />
      <View style={styles.rowTwo}>
        <View style={styles.rowItem}>
          <Input label="First Name" placeholder="Enter first name" value={form.firstName} onChangeText={(value) => updateField('firstName', value)} />
        </View>
        <View style={styles.rowItem}>
          <Input label="Last Name" placeholder="Enter last name" value={form.lastName} onChangeText={(value) => updateField('lastName', value)} />
        </View>
      </View>
      <Input label="Email Address" placeholder="Enter your email" keyboardType="email-address" value={form.email} onChangeText={(value) => updateField('email', value)} />
      <Input label="Phone Number" placeholder="Enter your phone number" keyboardType="phone-pad" value={form.phone} onChangeText={(value) => updateField('phone', value)} />
      <Input label="Password" placeholder="Enter your password" secureTextEntry={!showPassword} value={form.password} onChangeText={(value) => updateField('password', value)} rightText={showPassword ? 'Hide' : 'Show'} onRightPress={() => setShowPassword((prev) => !prev)} />
      <Input label="Confirm Password" placeholder="Confirm your password" secureTextEntry={!showPassword} value={form.confirmPassword} onChangeText={(value) => updateField('confirmPassword', value)} helperText={form.confirmPassword ? (passwordMatched ? 'Password matched' : 'Password not matched') : ''} helperColor={passwordMatched ? '#86EFAC' : '#FCA5A5'} />
    </>
  );

  const renderCustomerRegisterStepTwo = () => (
    <>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>Step 2 · Address Information</Text>
      </View>
      <Input label="Street Name" placeholder="Enter street name" value={form.streetName} onChangeText={(value) => updateField('streetName', value)} />
      <StatePickerField label="State" value={form.userState} onPress={() => openStateModal('userState', 'Choose Your State')} />
      <LgaPickerField label="Local Government" value={form.userLga} items={userLgas.map((lga) => (typeof lga === 'object' ? lga.name : lga))} onPick={(value) => updateField('userLga', value)} disabled={!form.userState} />
      <View style={styles.rowTwo}>
        <View style={styles.rowItem}>
          <Input label="Postal Number" placeholder="Enter postal number" keyboardType="number-pad" value={form.postalNumber} onChangeText={(value) => updateField('postalNumber', value)} />
        </View>
        <View style={styles.rowItem}>
          <Input label="Latitude" placeholder="Enter latitude" value={form.lat} onChangeText={(value) => updateField('lat', value)} />
        </View>
      </View>
      <Input label="Longitude" placeholder="Enter longitude" value={form.long} onChangeText={(value) => updateField('long', value)} />
    </>
  );

  const renderAdminRegisterStepOne = () => (
    <>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>Step 1 · Owner Profile</Text>
      </View>
      <Input label="Username" placeholder="Enter username" value={form.username} onChangeText={(value) => updateField('username', value)} />
      <View style={styles.rowTwo}>
        <View style={styles.rowItem}>
          <Input label="First Name" placeholder="Enter first name" value={form.firstName} onChangeText={(value) => updateField('firstName', value)} />
        </View>
        <View style={styles.rowItem}>
          <Input label="Last Name" placeholder="Enter last name" value={form.lastName} onChangeText={(value) => updateField('lastName', value)} />
        </View>
      </View>
      <Input label="Email Address" placeholder="Enter your email" keyboardType="email-address" value={form.email} onChangeText={(value) => updateField('email', value)} />
      <Input label="Phone Number" placeholder="Enter your phone number" keyboardType="phone-pad" value={form.phone} onChangeText={(value) => updateField('phone', value)} />
    </>
  );

  const renderAdminRegisterStepTwo = () => (
    <>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>Step 2 · Personal Address</Text>
      </View>
      <Input label="Street Name" placeholder="Enter street name" value={form.streetName} onChangeText={(value) => updateField('streetName', value)} />
      <StatePickerField label="State" value={form.userState} onPress={() => openStateModal('userState', 'Choose Your State')} />
      <LgaPickerField label="Local Government" value={form.userLga} items={userLgas.map((lga) => (typeof lga === 'object' ? lga.name : lga))} onPick={(value) => updateField('userLga', value)} disabled={!form.userState} />
      <View style={styles.rowTwo}>
        <View style={styles.rowItem}>
          <Input label="Postal Number" placeholder="Enter postal number" keyboardType="number-pad" value={form.postalNumber} onChangeText={(value) => updateField('postalNumber', value)} />
        </View>
        <View style={styles.rowItem}>
          <Input label="Latitude" placeholder="Enter latitude" value={form.lat} onChangeText={(value) => updateField('lat', value)} />
        </View>
      </View>
      <Input label="Longitude" placeholder="Enter longitude" value={form.long} onChangeText={(value) => updateField('long', value)} />
    </>
  );

  const renderAdminRegisterStepThree = () => (
    <>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>Step 3 · Company Setup</Text>
      </View>
      <Input label="Company Name" placeholder="Enter company name" value={form.companyName} onChangeText={(value) => updateField('companyName', value)} />
      <Input label="Company Address" placeholder="Enter company address" value={form.companyAddress} onChangeText={(value) => updateField('companyAddress', value)} />
      <StatePickerField label="Company State" value={form.companyState} onPress={() => openStateModal('companyState', 'Choose Company State')} />
      <Input label="Password" placeholder="Enter your password" secureTextEntry={!showPassword} value={form.password} onChangeText={(value) => updateField('password', value)} rightText={showPassword ? 'Hide' : 'Show'} onRightPress={() => setShowPassword((prev) => !prev)} />
      <Input label="Confirm Password" placeholder="Confirm your password" secureTextEntry={!showPassword} value={form.confirmPassword} onChangeText={(value) => updateField('confirmPassword', value)} helperText={form.confirmPassword ? (passwordMatched ? 'Password matched' : 'Password not matched') : ''} helperColor={passwordMatched ? '#86EFAC' : '#FCA5A5'} />
    </>
  );

  const renderLoginOrStaff = () => (
    <>
      {role === 'Staff' && (
        <>
          <Input label="Branch Name" placeholder="Enter branch name" value={form.branchName} onChangeText={(value) => updateField('branchName', value)} />
          <Input label="Staff ID or Username" placeholder="Enter staff ID or username" value={form.employeeId} onChangeText={(value) => updateField('employeeId', value)} />
          <Input label="Email Address" placeholder="Enter your email" keyboardType="email-address" value={form.email} onChangeText={(value) => updateField('email', value)} />
        </>
      )}

      {(role === 'Customer' || role === 'Admin') && !isRegister && (
        <>
          <Input label="Email Address or Username" placeholder="Enter your email or username" value={form.email} onChangeText={(value) => updateField('email', value)} />
        </>
      )}

      <Input label="Password" placeholder="Enter your password" secureTextEntry={!showPassword} value={form.password} onChangeText={(value) => updateField('password', value)} rightText={showPassword ? 'Hide' : 'Show'} onRightPress={() => setShowPassword((prev) => !prev)} />
    </>
  );

  const renderRegistrationContent = () => {
    if (!isRegister) return renderLoginOrStaff();
    if (isCustomerRegister && registrationStep === 1) return renderCustomerRegisterStepOne();
    if (isCustomerRegister && registrationStep === 2) return renderCustomerRegisterStepTwo();
    if (isAdminRegister && registrationStep === 1) return renderAdminRegisterStepOne();
    if (isAdminRegister && registrationStep === 2) return renderAdminRegisterStepTwo();
    if (isAdminRegister && registrationStep === 3) return renderAdminRegisterStepThree();
    return renderLoginOrStaff();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#081120', '#0E1830', '#14264D', '#0C1324']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
        <Animated.View style={[styles.glowOne, { opacity: glowAnim }]} />
        <Animated.View style={[styles.glowTwo, { opacity: glowAnim }]} />
        <Animated.View style={[styles.glowThree, { opacity: glowAnim }]} />

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.brandRow, { opacity: fadeAnim, transform: [{ scale: logoScale }, { translateY: logoFloat }] }]}> 
              <Image source={require('@/assets/images/Ys.png')} style={styles.logoImage} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.brandTitle}>YSStore</Text>
                <Text style={styles.brandSubtitle}>Retail POS & Inventory System</Text>
              </View>
            </Animated.View>

            <View style={styles.heroBox}>
              <Text style={styles.heroBadge}>SMART RETAIL PLATFORM</Text>
              <Text style={styles.heroTitle}>Sales, stock, staff, branch control, and onboarding in one system.</Text>
              <Text style={styles.heroText}>Premium Nigerian retail onboarding with guided registration stages and clean state selection modal.</Text>
            </View>

            <View style={styles.switchWrapper}>
              {roles.map((item) => {
                const active = role === item;
                return (
                  <TouchableOpacity key={item} activeOpacity={0.9} style={[styles.rolePill, active && styles.rolePillActive]} onPress={() => setRole(item)}>
                    <Text style={[styles.rolePillText, active && styles.rolePillTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modeTabs}>
              {visibleModes.map((item) => {
                const active = mode === item;
                return (
                  <TouchableOpacity key={item} style={[styles.modeTab, active && styles.modeTabActive]} onPress={() => setMode(item)} activeOpacity={0.9}>
                    <Text style={[styles.modeText, active && styles.modeTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: cardScale }] }]}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>

              {showRegistrationPager && (
                <View style={styles.pagerWrap}>
                  <View style={styles.pagerHeaderRow}>
                    <Text style={styles.pagerTitle}>Registration Progress</Text>
                    <Text style={styles.pagerCount}>Step {registrationStep} of {totalSteps}</Text>
                  </View>
                  <View style={styles.pagerBarBg}>
                    <View style={[styles.pagerBarFill, { width: `${(registrationStep / totalSteps) * 100}%` }]} />
                  </View>
                  <View style={styles.pagerDotsRow}>
                    {Array.from({ length: totalSteps }).map((_, index) => {
                      const stepNo = index + 1;
                      const active = stepNo === registrationStep;
                      const done = stepNo < registrationStep;
                      return <View key={stepNo} style={[styles.pagerDot, active && styles.pagerDotActive, done && styles.pagerDotDone]} />;
                    })}
                  </View>
                </View>
              )}

              {renderRegistrationContent()}

              {!isRegister && (
                <TouchableOpacity activeOpacity={0.8} style={styles.forgotRow}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              )}

              {showRegistrationPager && (
                <View style={styles.navButtonsRow}>
                  {canGoBack() ? (
                    <TouchableOpacity activeOpacity={0.9} style={styles.secondaryNavBtn} onPress={goBack}>
                      <Text style={styles.secondaryNavBtnText}>Back</Text>
                    </TouchableOpacity>
                  ) : <View style={{ flex: 1 }} />}

                  {canGoNext() ? (
                    <TouchableOpacity activeOpacity={0.9} style={styles.secondaryNavBtn} onPress={goNext}>
                      <Text style={styles.secondaryNavBtnText}>Next</Text>
                    </TouchableOpacity>
                  ) : <View style={{ flex: 1 }} />}
                </View>
              )}

              <Animated.View style={{ transform: [{ scale: buttonPulse }] }}>
                <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton}>
                  <LinearGradient colors={['#22C55E', '#16A34A', '#15803D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryGradient}>
                    <Text style={styles.primaryButtonText}>
                      {showRegistrationPager && canGoNext()
                        ? 'Complete Current Stage'
                        : role === 'Admin' && isRegister
                          ? 'Create Admin & Company'
                          : role === 'Staff'
                            ? 'Staff Login'
                            : isRegister
                              ? `Create ${role} Account`
                              : `${role} Login`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.9}><Text style={styles.socialBtnText}>Google</Text></TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.9}><Text style={styles.socialBtnText}>Phone</Text></TouchableOpacity>
              </View>

              {role !== 'Staff' && (
                <TouchableOpacity activeOpacity={0.8} onPress={() => setMode(isRegister ? 'Login' : 'Register')} style={styles.bottomTextRow}>
                  <Text style={styles.bottomTextMuted}>{isRegister ? 'Already have an account? ' : "Don't have an account? "}</Text>
                  <Text style={styles.bottomTextAction}>{isRegister ? 'Login' : 'Register'}</Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            <View style={styles.featureRow}>
              <FeatureCard title="Guided Stages" text="Customer and admin registration now move in clear onboarding steps." />
              <FeatureCard title="State Modal" text="User and company state selection now uses a cleaner modal picker." />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal visible={stateModal.visible} transparent animationType="slide" onRequestClose={closeStateModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{stateModal.title}</Text>
                <TouchableOpacity onPress={closeStateModal} activeOpacity={0.8} style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {stateNames.map((item) => {
                  const active = (stateModal.target === 'userState' && form.userState === item) || (stateModal.target === 'companyState' && form.companyState === item);
                  return (
                    <TouchableOpacity key={item} activeOpacity={0.9} style={[styles.modalOption, active && styles.modalOptionActive]} onPress={() => handleStatePicked(item)}>
                      <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

function Input({ label, rightText, onRightPress, helperText, helperColor, ...props }) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputBox}>
        <TextInput placeholderTextColor="rgba(226,232,240,0.48)" style={styles.input} {...props} />
        {rightText ? (
          <TouchableOpacity onPress={onRightPress} activeOpacity={0.8}>
            <Text style={styles.inputRightText}>{rightText}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {helperText ? <Text style={[styles.helperText, { color: helperColor || '#86EFAC' }]}>{helperText}</Text> : null}
    </View>
  );
}

function StatePickerField({ label, value, onPress }) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity activeOpacity={0.9} style={styles.inputBox} onPress={onPress}>
        <Text style={[styles.input, !value && styles.placeholderText]}>{value || 'Tap to choose state'}</Text>
        <Text style={styles.pickText}>Choose</Text>
      </TouchableOpacity>
    </View>
  );
}

function LgaPickerField({ label, value, items, onPick, disabled }) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputBox, disabled && styles.inputBoxDisabled]}>
        <Text style={[styles.input, !value && styles.placeholderText, disabled && styles.disabledText]}>{value || (disabled ? 'Select state first' : 'Choose local government')}</Text>
      </View>
      {!disabled && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsWrap}>
          {items.map((item) => {
            const active = value === item;
            return (
              <TouchableOpacity key={item} activeOpacity={0.85} style={[styles.optionPill, active && styles.optionPillActive]} onPress={() => onPick(item)}>
                <Text style={[styles.optionPillText, active && styles.optionPillTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function FeatureCard({ title, text }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#081120' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12 },
  glowOne: { position: 'absolute', top: 80, right: -30, width: 180, height: 180, borderRadius: 999, backgroundColor: 'rgba(34,197,94,0.18)' },
  glowTwo: { position: 'absolute', bottom: 130, left: -60, width: 200, height: 200, borderRadius: 999, backgroundColor: 'rgba(59,130,246,0.16)' },
  glowThree: { position: 'absolute', top: 260, left: width / 2 - 70, width: 140, height: 140, borderRadius: 999, backgroundColor: 'rgba(239,68,68,0.08)' },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  logoImage: { width: 84, height: 84, marginRight: 12 ,borderRadius:100},
  brandTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  brandSubtitle: { marginTop: 2, color: 'rgba(255,255,255,0.70)', fontSize: 12 },
  heroBox: { marginBottom: 18 },
  heroBadge: { color: '#86EFAC', fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  heroTitle: { color: '#FFFFFF', fontSize: 30, lineHeight: 38, fontWeight: '900', maxWidth: '95%' },
  heroText: { marginTop: 10, color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 22 },
  switchWrapper: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 6, marginBottom: 14 },
  rolePill: { flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
  rolePillActive: { backgroundColor: 'rgba(34,197,94,0.18)', borderWidth: 1, borderColor: 'rgba(134,239,172,0.28)' },
  rolePillText: { color: 'rgba(255,255,255,0.72)', fontWeight: '700' },
  rolePillTextActive: { color: '#FFFFFF' },
  modeTabs: { flexDirection: 'row', marginBottom: 14 },
  modeTab: { flex: 1, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent', alignItems: 'center' },
  modeTabActive: { borderBottomColor: '#22C55E' },
  modeText: { color: 'rgba(255,255,255,0.64)', fontWeight: '700' },
  modeTextActive: { color: '#FFFFFF' },
  card: { width: CARD_WIDTH, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 28, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', shadowColor: '#000000', shadowOpacity: 0.24, shadowRadius: 16, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  cardTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  cardSubtitle: { color: 'rgba(255,255,255,0.68)', fontSize: 13, lineHeight: 20, marginTop: 6, marginBottom: 18 },
  pagerWrap: { marginBottom: 18, padding: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  pagerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  pagerTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  pagerCount: { color: '#86EFAC', fontSize: 12, fontWeight: '800' },
  pagerBarBg: { height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  pagerBarFill: { height: 8, borderRadius: 999, backgroundColor: '#22C55E' },
  pagerDotsRow: { flexDirection: 'row', marginTop: 12 },
  pagerDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', marginRight: 8 },
  pagerDotActive: { backgroundColor: '#86EFAC', transform: [{ scale: 1.15 }] },
  pagerDotDone: { backgroundColor: '#22C55E' },
  sectionBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(34,197,94,0.14)', borderWidth: 1, borderColor: 'rgba(134,239,172,0.18)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14 },
  sectionBadgeText: { color: '#BBF7D0', fontSize: 12, fontWeight: '800' },
  rowTwo: { flexDirection: 'row', gap: 10 },
  rowItem: { flex: 1 },
  inputWrapper: { marginBottom: 14 },
  inputLabel: { color: '#E2E8F0', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  inputBox: { minHeight: 58, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputBoxDisabled: { opacity: 0.7 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  placeholderText: { color: 'rgba(226,232,240,0.48)' },
  disabledText: { color: 'rgba(255,255,255,0.55)' },
  inputRightText: { color: '#86EFAC', fontWeight: '700', marginLeft: 12 },
  pickText: { color: '#86EFAC', fontWeight: '800', marginLeft: 12 },
  helperText: { marginTop: 6, fontSize: 12, fontWeight: '700' },
  optionsWrap: { paddingTop: 8, paddingRight: 10 },
  optionPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginRight: 8 },
  optionPillActive: { backgroundColor: 'rgba(34,197,94,0.18)', borderColor: 'rgba(134,239,172,0.28)' },
  optionPillText: { color: 'rgba(255,255,255,0.72)', fontWeight: '700', fontSize: 12 },
  optionPillTextActive: { color: '#FFFFFF' },
  forgotRow: { alignSelf: 'flex-end', marginBottom: 18, marginTop: 4 },
  forgotText: { color: '#93C5FD', fontWeight: '700' },
  navButtonsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  secondaryNavBtn: { flex: 1, minHeight: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  secondaryNavBtnText: { color: '#FFFFFF', fontWeight: '800' },
  primaryButton: { borderRadius: 18, overflow: 'hidden' },
  primaryGradient: { minHeight: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 18 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  divider: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
  dividerText: { color: 'rgba(255,255,255,0.52)', fontSize: 12, marginHorizontal: 10 },
  socialRow: { flexDirection: 'row', justifyContent: 'space-between' },
  socialBtn: { flex: 1, minHeight: 52, marginHorizontal: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  socialBtnText: { color: '#FFFFFF', fontWeight: '700' },
  bottomTextRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  bottomTextMuted: { color: 'rgba(255,255,255,0.62)' },
  bottomTextAction: { color: '#86EFAC', fontWeight: '900' },
  featureRow: { flexDirection: 'row', marginTop: 16 },
  featureCard: { flex: 1, marginHorizontal: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  featureTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginBottom: 6 },
  featureText: { color: 'rgba(255,255,255,0.64)', fontSize: 12, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.72)', justifyContent: 'flex-end' },
  modalCard: { maxHeight: '78%', backgroundColor: '#0F172A', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  modalCloseBtn: { width: 38, height: 38, borderRadius: 999, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  modalCloseText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  modalOption: { minHeight: 52, borderRadius: 16, paddingHorizontal: 16, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginBottom: 10 },
  modalOptionActive: { backgroundColor: 'rgba(34,197,94,0.18)', borderColor: 'rgba(134,239,172,0.28)' },
  modalOptionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  modalOptionTextActive: { color: '#BBF7D0' },
});
