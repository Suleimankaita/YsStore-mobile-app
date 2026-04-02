import React, { useEffect, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenFadeWrapper from '../../components/ui/screenwrapper';
// import ScreenFadeWrapper from '../../screens/AdminLoginScreen';

import { router } from 'expo-router';

const roles = [
  {
    id: 'user',
    title: 'Customer',
    subtitle: 'Buy products, track orders and manage your account',
    route: '(screens)/auth/UserLoginScreen',
    emoji: '🛍️',
  },
  {
    id: 'staff',
    title: 'Staff',
    subtitle: 'Access store operations and assigned tasks',
    route: '(screens)/auth/StaffLoginScreen',
    emoji: '🧾',
  },
  {
    id: 'admin',
    title: 'Admin',
    subtitle: 'Manage business, staff, sales and analytics',
    route: '(screens)/AdminLoginScreen',
    emoji: '🏢',
  },
];

const RoleSelectionScreen = ({ navigation }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const bubbleTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.topBubble,
            { transform: [{ translateY: bubbleTranslateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.bottomBubble,
            { transform: [{ translateY: Animated.multiply(bubbleTranslateY, -1) }] },
          ]}
        />

        <ScreenFadeWrapper style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.brand}>YSStore</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Choose how you want to continue
            </Text>
          </View>

          <View style={styles.cardList}>
            {roles.map((role, index) => (
              <TouchableOpacity
                key={role.id}
                activeOpacity={0.9}
                style={[styles.roleCard, { marginTop: index === 0 ? 0 : 14 }]}
                onPress={() => router.push(role.route)}
              >
                <View style={styles.roleIcon}>
                  <Text style={styles.roleEmoji}>{role.emoji}</Text>
                </View>

                <View style={styles.roleTextBox}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                </View>

                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScreenFadeWrapper>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E1016',
  },
  container: {
    flex: 1,
    backgroundColor: '#0E1016',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  content: {
    zIndex: 2,
  },
  header: {
    marginBottom: 28,
  },
  brand: {
    color: '#8B93A7',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 1.2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: '#9AA3B5',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  cardList: {
    marginTop: 10,
  },
  roleCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(109,94,248,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  roleEmoji: {
    fontSize: 24,
  },
  roleTextBox: {
    flex: 1,
  },
  roleTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  roleSubtitle: {
    color: '#9AA3B5',
    fontSize: 13,
    lineHeight: 18,
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 28,
    marginLeft: 10,
  },
  topBubble: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(109,94,248,0.18)',
    top: 40,
    right: -50,
    zIndex: 0,
  },
  bottomBubble: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: 'rgba(0,194,255,0.10)',
    bottom: -60,
    left: -90,
    zIndex: 0,
  },
});

export default RoleSelectionScreen;