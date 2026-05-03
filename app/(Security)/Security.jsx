import React, { useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Switch,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import {
  GestureHandlerRootView,
  Swipeable,
  RectButton,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  tomato: "#ff6347",
  tomatoDark: "#ef4444",
  sky: "#38bdf8",
  skyDark: "#0284c7",
  bg: "#f4f7fb",
  white: "#ffffff",
  dark: "#0f172a",
  muted: "#64748b",
  border: "#e5e7eb",
  green: "#16a34a",
  yellow: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
};

const initialDevices = [
  {
    id: "1",
    name: "Samsung Galaxy A15",
    location: "Katsina, Nigeria",
    lastActive: "Active now",
    current: true,
    icon: "phone-portrait-outline",
  },
  {
    id: "2",
    name: "Chrome on Windows",
    location: "Abuja, Nigeria",
    lastActive: "Yesterday, 8:30 PM",
    current: false,
    icon: "laptop-outline",
  },
  {
    id: "3",
    name: "iPhone Safari",
    location: "Lagos, Nigeria",
    lastActive: "Apr 25, 2026",
    current: false,
    icon: "phone-portrait-outline",
  },
];

const initialActivities = [
  {
    id: "1",
    title: "Successful login",
    desc: "Login from Samsung Galaxy A15",
    time: "Today, 9:45 AM",
    type: "success",
    icon: "shield-checkmark-outline",
  },
  {
    id: "2",
    title: "Password changed",
    desc: "Your password was updated successfully",
    time: "Apr 30, 2026",
    type: "success",
    icon: "key-outline",
  },
  {
    id: "3",
    title: "New device detected",
    desc: "Chrome browser signed in to your account",
    time: "Apr 28, 2026",
    type: "warning",
    icon: "alert-circle-outline",
  },
];

const SecurityScreen = ({ navigation }) => {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlertEnabled, setLoginAlertEnabled] = useState(true);

  const [trustedDevices, setTrustedDevices] = useState(initialDevices);
  const [activityLogs, setActivityLogs] = useState(initialActivities);

  const [refreshing, setRefreshing] = useState(false);
  const [modalType, setModalType] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const openedSwipeRef = useRef(null);

  const securityScore = useMemo(() => {
    let score = 35;

    if (biometricEnabled) score += 25;
    if (twoFactorEnabled) score += 30;
    if (loginAlertEnabled) score += 10;

    return Math.min(score, 100);
  }, [biometricEnabled, twoFactorEnabled, loginAlertEnabled]);

  const scoreColor =
    securityScore >= 80
      ? COLORS.green
      : securityScore >= 60
      ? COLORS.yellow
      : COLORS.red;

  const addActivity = ({ title, desc, type = "success", icon }) => {
    const newActivity = {
      id: String(Date.now()),
      title,
      desc,
      time: "Just now",
      type,
      icon,
    };

    setActivityLogs((prev) => [newActivity, ...prev]);
  };

  const closeModal = () => {
    setModalType(null);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPin("");
    setConfirmPin("");
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
      Alert.alert("Updated", "Security settings refreshed.");
    }, 700);
  }, []);

  const closeOpenedSwipe = () => {
    if (openedSwipeRef.current) {
      openedSwipeRef.current.close();
      openedSwipeRef.current = null;
    }
  };

  const handleSwipeOpen = (ref) => {
    if (openedSwipeRef.current && openedSwipeRef.current !== ref.current) {
      openedSwipeRef.current.close();
    }

    openedSwipeRef.current = ref.current;
  };

  const handleBiometricToggle = async () => {
    if (biometricEnabled) {
      Alert.alert("Disable Biometric Login?", "You will use password login instead.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disable",
          style: "destructive",
          onPress: () => {
            setBiometricEnabled(false);
            addActivity({
              title: "Biometric disabled",
              desc: "Biometric login was turned off",
              type: "warning",
              icon: "finger-print-outline",
            });
          },
        },
      ]);

      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware) {
      Alert.alert("Not supported", "This device does not support biometric login.");
      return;
    }

    if (!isEnrolled) {
      Alert.alert(
        "Biometric not set",
        "Please set fingerprint or face unlock on your phone first."
      );
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Enable biometric login",
      fallbackLabel: "Use password",
      cancelLabel: "Cancel",
    });

    if (result.success) {
      setBiometricEnabled(true);
      addActivity({
        title: "Biometric enabled",
        desc: "Fingerprint or face unlock was enabled",
        type: "success",
        icon: "finger-print-outline",
      });
      Alert.alert("Enabled", "Biometric login is now active.");
    } else {
      Alert.alert("Failed", "Biometric verification was not completed.");
    }
  };

  const handleTwoFactorToggle = () => {
    if (twoFactorEnabled) {
      Alert.alert("Disable 2FA?", "This will reduce your account protection.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disable",
          style: "destructive",
          onPress: () => {
            setTwoFactorEnabled(false);
            addActivity({
              title: "2FA disabled",
              desc: "Two-factor authentication was turned off",
              type: "warning",
              icon: "shield-half-outline",
            });
          },
        },
      ]);

      return;
    }

    Alert.alert("Enable 2FA?", "Your account will need extra verification when logging in.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Enable",
        onPress: () => {
          setTwoFactorEnabled(true);
          addActivity({
            title: "2FA enabled",
            desc: "Two-factor authentication was turned on",
            type: "success",
            icon: "shield-half-outline",
          });
        },
      },
    ]);
  };

  const handleLoginAlertToggle = () => {
    setLoginAlertEnabled((prev) => !prev);

    addActivity({
      title: !loginAlertEnabled ? "Login alerts enabled" : "Login alerts disabled",
      desc: !loginAlertEnabled
        ? "You will receive alerts for new logins"
        : "Login alerts were turned off",
      type: !loginAlertEnabled ? "success" : "warning",
      icon: "notifications-outline",
    });
  };

  const handleChangePassword = () => {
    if (!oldPassword.trim()) {
      Alert.alert("Current password required", "Enter your current password.");
      return;
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert("Weak password", "New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password mismatch", "New password and confirm password must match.");
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert("Invalid password", "New password must be different from old password.");
      return;
    }

    // Connect your backend API here:
    // await changePassword({ oldPassword, newPassword }).unwrap();

    closeModal();

    addActivity({
      title: "Password changed",
      desc: "Your account password was updated",
      type: "success",
      icon: "key-outline",
    });

    Alert.alert("Successful", "Password changed successfully.");
  };

  const handleUpdatePin = () => {
    if (!pin || pin.length < 4) {
      Alert.alert("Invalid PIN", "PIN must be at least 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert("PIN mismatch", "Both PIN fields must match.");
      return;
    }

    // Connect your backend API here:
    // await updateTransactionPin({ pin }).unwrap();

    closeModal();

    addActivity({
      title: "Transaction PIN updated",
      desc: "Your wallet transaction PIN was changed",
      type: "success",
      icon: "dialpad-outline",
    });

    Alert.alert("Successful", "Transaction PIN updated.");
  };

  const removeDevice = (device) => {
    if (device.current) {
      Alert.alert("Current device", "You cannot remove the device you are using now.");
      return;
    }

    Alert.alert("Remove Device?", `Remove ${device.name} from trusted devices?`, [
      { text: "Cancel", style: "cancel", onPress: closeOpenedSwipe },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setTrustedDevices((prev) => prev.filter((item) => item.id !== device.id));

          addActivity({
            title: "Device removed",
            desc: `${device.name} was removed from trusted devices`,
            type: "warning",
            icon: "trash-outline",
          });

          closeOpenedSwipe();
        },
      },
    ]);
  };

  const deleteActivity = (activity) => {
    setActivityLogs((prev) => prev.filter((item) => item.id !== activity.id));
    closeOpenedSwipe();
  };

  const handleLogoutAllDevices = () => {
    const otherDevices = trustedDevices.filter((device) => !device.current);

    if (otherDevices.length === 0) {
      Alert.alert("No other devices", "Only your current device is active.");
      return;
    }

    Alert.alert(
      "Logout All Devices?",
      "This will remove all trusted devices except your current device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            setTrustedDevices((prev) => prev.filter((device) => device.current));

            addActivity({
              title: "Other devices logged out",
              desc: "All other trusted devices were removed",
              type: "warning",
              icon: "log-out-outline",
            });

            Alert.alert("Done", "All other devices have been logged out.");
          },
        },
      ]
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tomato} />

      <LinearGradient
        colors={[COLORS.tomato, COLORS.sky]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerIcon}
            onPress={() => navigation?.goBack?.()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Security</Text>
            <Text style={styles.headerSubtitle}>Protect your YsStore account</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerIcon}
            onPress={() =>
              Alert.alert(
                "Security Help",
                "Use biometric login, 2FA, login alerts, and a strong password to keep your account safe."
              )
            }
          >
            <Ionicons name="help-circle-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <View style={styles.scoreIconBox}>
              <Ionicons
                name="shield-checkmark-outline"
                size={31}
                color={COLORS.white}
              />
            </View>

            <View>
              <Text style={styles.scoreLabel}>Security Score</Text>
              <Text style={styles.scoreText}>{securityScore}% Protected</Text>
            </View>
          </View>

          <View style={styles.scoreCircleOuter}>
            <View style={[styles.scoreCircleInner, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreCircleText, { color: scoreColor }]}>
                {securityScore}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.securityHintCard}>
          <View style={styles.hintIcon}>
            <Ionicons name="lock-closed-outline" size={22} color={COLORS.skyDark} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.hintTitle}>Keep your account safe</Text>
            <Text style={styles.hintText}>
              Enable biometric login, 2FA, and login alerts to reduce unauthorized access.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Login Protection</Text>
          <Text style={styles.sectionSubtitle}>Control how your account is accessed</Text>
        </View>

        <SecurityToggle
          icon="finger-print-outline"
          title="Biometric Login"
          desc="Use fingerprint or face unlock"
          value={biometricEnabled}
          onValueChange={handleBiometricToggle}
          color={COLORS.skyDark}
        />

        <SecurityToggle
          icon="shield-half-outline"
          title="Two-Factor Authentication"
          desc="Add extra verification when logging in"
          value={twoFactorEnabled}
          onValueChange={handleTwoFactorToggle}
          color={COLORS.green}
        />

        <SecurityToggle
          icon="notifications-outline"
          title="Login Alerts"
          desc="Get notified when your account logs in"
          value={loginAlertEnabled}
          onValueChange={handleLoginAlertToggle}
          color={COLORS.yellow}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <Text style={styles.sectionSubtitle}>Manage passwords and transaction access</Text>
        </View>

        <ActionRow
          icon="key-outline"
          title="Change Password"
          desc="Update your account password"
          color={COLORS.tomato}
          onPress={() => setModalType("password")}
        />

        <ActionRow
          icon="dialpad-outline"
          title="Transaction PIN"
          desc="Secure withdrawals and wallet transfers"
          color={COLORS.purple}
          onPress={() => setModalType("pin")}
        />

        <ActionRow
          icon="log-out-outline"
          title="Logout All Other Devices"
          desc="Sign out every device except this one"
          color={COLORS.red}
          onPress={handleLogoutAllDevices}
          danger
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trusted Devices</Text>
          <Text style={styles.sectionSubtitle}>Swipe left to remove a device</Text>
        </View>

        {trustedDevices.map((device) => (
          <SwipeableDeviceCard
            key={device.id}
            device={device}
            onRemove={() => removeDevice(device)}
            onSwipeOpen={handleSwipeOpen}
          />
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Security Activity</Text>
          <Text style={styles.sectionSubtitle}>Swipe left to delete an activity log</Text>
        </View>

        {activityLogs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="shield-checkmark-outline" size={42} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No security activity</Text>
            <Text style={styles.emptySubtitle}>Your security logs will appear here.</Text>
          </View>
        ) : (
          activityLogs.map((activity) => (
            <SwipeableActivityCard
              key={activity.id}
              activity={activity}
              onDelete={() => deleteActivity(activity)}
              onSwipeOpen={handleSwipeOpen}
            />
          ))
        )}

        <View style={{ height: 35 }} />
      </ScrollView>

      <ActionModal
        visible={modalType === "password"}
        title="Change Password"
        subtitle="Use a strong password for better protection"
        onClose={closeModal}
      >
        <InputField
          label="Current Password"
          placeholder="Enter current password"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />

        <InputField
          label="New Password"
          placeholder="Enter new password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <InputField
          label="Confirm New Password"
          placeholder="Confirm new password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <PrimaryButton title="Update Password" onPress={handleChangePassword} />
      </ActionModal>

      <ActionModal
        visible={modalType === "pin"}
        title="Transaction PIN"
        subtitle="Create or update your wallet security PIN"
        onClose={closeModal}
      >
        <InputField
          label="New PIN"
          placeholder="Enter 4 digit PIN"
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
          value={pin}
          onChangeText={(text) => setPin(text.replace(/[^0-9]/g, ""))}
        />

        <InputField
          label="Confirm PIN"
          placeholder="Confirm PIN"
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
          value={confirmPin}
          onChangeText={(text) => setConfirmPin(text.replace(/[^0-9]/g, ""))}
        />

        <PrimaryButton title="Save PIN" onPress={handleUpdatePin} />
      </ActionModal>
    </GestureHandlerRootView>
  );
};

const SecurityToggle = ({ icon, title, desc, value, onValueChange, color }) => {
  return (
    <View style={styles.settingCard}>
      <View style={[styles.settingIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={23} color={color} />
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDesc}>{desc}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#cbd5e1", true: "#bae6fd" }}
        thumbColor={value ? COLORS.skyDark : "#f8fafc"}
      />
    </View>
  );
};

const ActionRow = ({ icon, title, desc, color, onPress, danger }) => {
  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.settingCard} onPress={onPress}>
      <View style={[styles.settingIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={23} color={color} />
      </View>

      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && { color: COLORS.red }]}>
          {title}
        </Text>
        <Text style={styles.settingDesc}>{desc}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
    </TouchableOpacity>
  );
};

const SwipeableDeviceCard = ({ device, onRemove, onSwipeOpen }) => {
  const swipeRef = useRef(null);

  const renderRightActions = () => {
    if (device.current) {
      return null;
    }

    return (
      <RectButton style={styles.swipeDeleteAction} onPress={onRemove}>
        <Ionicons name="trash-outline" size={24} color={COLORS.white} />
        <Text style={styles.swipeDeleteText}>Remove</Text>
      </RectButton>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      onSwipeableOpen={() => onSwipeOpen(swipeRef)}
    >
      <View style={styles.deviceCard}>
        <View style={styles.deviceLeft}>
          <View
            style={[
              styles.deviceIcon,
              {
                backgroundColor: device.current ? "#e0f2fe" : "#f1f5f9",
              },
            ]}
          >
            <Ionicons
              name={device.icon}
              size={25}
              color={device.current ? COLORS.skyDark : COLORS.muted}
            />
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.deviceTitleRow}>
              <Text style={styles.deviceName}>{device.name}</Text>

              {device.current && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </View>

            <Text style={styles.deviceMeta}>{device.location}</Text>
            <Text style={styles.deviceTime}>{device.lastActive}</Text>
          </View>
        </View>
      </View>
    </Swipeable>
  );
};

const SwipeableActivityCard = ({ activity, onDelete, onSwipeOpen }) => {
  const swipeRef = useRef(null);

  const isWarning = activity.type === "warning";
  const color = isWarning ? COLORS.yellow : COLORS.green;

  const renderRightActions = () => {
    return (
      <RectButton style={styles.swipeDeleteAction} onPress={onDelete}>
        <Ionicons name="trash-outline" size={24} color={COLORS.white} />
        <Text style={styles.swipeDeleteText}>Delete</Text>
      </RectButton>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      onSwipeableOpen={() => onSwipeOpen(swipeRef)}
    >
      <View style={styles.activityCard}>
        <View style={[styles.activityIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={activity.icon} size={22} color={color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityDesc}>{activity.desc}</Text>
          <Text style={styles.activityTime}>{activity.time}</Text>
        </View>
      </View>
    </Swipeable>
  );
};

const ActionModal = ({ visible, title, subtitle, children, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>{subtitle}</Text>
            </View>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const InputField = ({ label, ...props }) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        placeholderTextColor="#94a3b8"
        style={styles.modalInput}
        {...props}
      />
    </View>
  );
};

const PrimaryButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.primaryButton} onPress={onPress}>
      <LinearGradient
        colors={[COLORS.tomato, COLORS.sky]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryGradient}
      >
        <Text style={styles.primaryButtonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default SecurityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  topGradient: {
    paddingTop: Platform.OS === "android" ? 30 : 46,
    paddingHorizontal: 16,
    paddingBottom: 56,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleBox: {
    alignItems: "center",

  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.white,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 11.5,
    fontWeight: "600",
    color: "rgba(255,255,255,0.82)",
  },

  scoreCard: {
    marginTop: 18,
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  scoreLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  scoreIconBox: {
    width: 54,
    height: 54,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.76)",
  },

  scoreText: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.white,
  },

  scoreCircleOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreCircleInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  scoreCircleText: {
    fontSize: 15,
    fontWeight: "900",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  securityHintCard: {
    // marginTop: -46,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#e0f2fe",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  hintIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },

  hintTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.dark,
  },

  hintText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.muted,
    fontWeight: "600",
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.dark,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.muted,
  },

  settingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.dark,
  },

  settingDesc: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },

  deviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  deviceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  deviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  deviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  deviceName: {
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.dark,
  },

  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#dcfce7",
  },

  currentBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#15803d",
  },

  deviceMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },

  deviceTime: {
    marginTop: 3,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#94a3b8",
  },

  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  activityIcon: {
    width: 47,
    height: 47,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  activityTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.dark,
  },

  activityDesc: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },

  activityTime: {
    marginTop: 5,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#94a3b8",
  },

  swipeDeleteAction: {
    width: 92,
    backgroundColor: COLORS.red,
    borderRadius: 22,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  swipeDeleteText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.white,
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    color: COLORS.dark,
    fontWeight: "900",
  },

  emptySubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "600",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.45)",
  },

  modalBackdrop: {
    flex: 1,
  },

  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 35 : 24,
  },

  modalHandle: {
    width: 45,
    height: 5,
    borderRadius: 20,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 18,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 12,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.dark,
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
  },

  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  inputGroup: {
    marginBottom: 14,
  },

  inputLabel: {
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.dark,
  },

  modalInput: {
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.dark,
  },

  primaryButton: {
    marginTop: 8,
    borderRadius: 18,
    overflow: "hidden",
  },

  primaryGradient: {
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.white,
  },
});