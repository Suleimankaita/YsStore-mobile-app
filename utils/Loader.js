import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, Animated, Dimensions, Easing, Modal
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
// import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

const modules = [
  { icon: "🛍️", label: "Inventory Cloud Sync", color: "#60A5FA" },
  { icon: "💳", label: "Encrypted POS Terminal", color: "#34D399" },
  { icon: "📈", label: "Real-time Sales Analytics", color: "#FB923C" },
  { icon: "🚀", label: "E-commerce Optimization", color: "#C084FC" },
];

const UltraMagicalLoader = ({ isLoading = true, children }) => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const [visible, setVisible] = useState(true);

  // Animation Values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // --- AUDIO FEEDBACK ---
  const playSuccessChime = async () => {
    try {
      // Note: In RN, you usually load a small .mp3 or .wav file
      // const { sound } = await Audio.Sound.createAsync(require('./assets/success.mp3'));
      // await sound.playAsync();
      console.log("Chime played (Replace with sound file in production)");
    } catch (e) {
      console.log("Audio error", e);
    }
  };

  // --- ANIMATION LOGIC ---
  useEffect(() => {
    // 1. Icon Switcher
    const iconInterval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % modules.length);
    }, 1800);

    // 2. Floating & Pulsing Animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -12, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // 3. Progress Bar Animation
    Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 200,
        duration: 2000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    ).start();

    return () => clearInterval(iconInterval);
  }, []);

  // Exit Animation
  useEffect(() => {
    if (!isLoading) {
      playSuccessChime();
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }
  }, [isLoading]);

  if (!visible) return children;

  return (
    <View style={{ flex: 1 }}>
      {children}
      
      <Modal transparent visible={visible} animationType="none">
        <Animated.View style={[styles.fullScreen, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          
          {/* CONTENT CONTAINER */}
          <View style={styles.content}>
            
            {/* THE POS HUB */}
            <View style={styles.hubWrapper}>
              <Animated.View style={[styles.pingCircle, { transform: [{ scale: pulseAnim }], opacity: 0.2 }]} />
              <View style={styles.iconBox}>
                <Text style={[styles.mainEmoji, { color: modules[currentIcon].color }]}>
                  {modules[currentIcon].icon}
                </Text>
                <Text style={styles.sparkle}>✨</Text>
              </View>
            </View>

            {/* BRANDING */}
            <View style={styles.brandingRow}>
              <Animated.View style={[styles.logoDiamond, { transform: [{ translateY: floatAnim }, { rotate: '45deg' }] }]}>
                <Svg viewBox="0 0 24 24" style={styles.starIcon}>
                  <Path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="white" />
                </Svg>
              </Animated.View>
              
              <View style={styles.brandTextContainer}>
                <Text style={styles.brandYs}>Ys</Text>
                <View>
                  <Text style={styles.brandStore}>Store</Text>
                  {/* Shimmer effect placeholder */}
                  <View style={styles.shimmerLine} />
                </View>
              </View>
            </View>

            {/* STATUS INDICATOR */}
            <View style={styles.statusContainer}>
              <View style={styles.statusBadge}>
                <View style={styles.redDot} />
                <Text style={styles.statusLabel}>{modules[currentIcon].label}</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <Animated.View 
                  style={[
                    styles.progressBarFill, 
                    { transform: [{ translateX: progressAnim }] }
                  ]} 
                />
              </View>
            </View>

            {/* TAGLINE */}
            <View style={styles.tagline}>
              <Text style={styles.taglineText}>POS TERMINAL V1.0</Text>
              <Text style={styles.taglineText}>SECURE CHECKOUT</Text>
            </View>

          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', width: '100%' },
  hubWrapper: { marginBottom: 60, justifyContent: 'center', alignItems: 'center' },
  pingCircle: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  iconBox: {
    width: 90, height: 90, backgroundColor: '#1A1F2C', borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15,
  },
  mainEmoji: { fontSize: 40 },
  sparkle: { position: 'absolute', top: -5, right: -5, fontSize: 18 },
  
  brandingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  logoDiamond: { padding: 8, backgroundColor: '#DC2626', borderRadius: 12, shadowColor: '#DC2626', shadowOpacity: 0.6, shadowRadius: 10, elevation: 10 },
  starIcon: { width: 30, height: 30, transform: [{ rotate: '-45deg' }] },
  brandTextContainer: { flexDirection: 'row', marginLeft: 15 },
  brandYs: { fontSize: 50, fontWeight: '900', color: '#FFF', fontStyle: 'italic' },
  brandStore: { fontSize: 50, fontWeight: '900', color: '#DC2626', fontStyle: 'italic' },
  shimmerLine: { position: 'absolute', bottom: 10, width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.2)' },

  statusContainer: { alignItems: 'center', gap: 15 },
  statusBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', 
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' 
  },
  redDot: { width: 8, height: 8, backgroundColor: '#DC2626', borderRadius: 4, marginRight: 8 },
  statusLabel: { color: '#D1D5DB', fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  
  progressBarBg: { width: 180, height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { width: 60, height: '100%', backgroundColor: '#DC2626', borderRadius: 2 },

  tagline: { position: 'absolute', bottom: -120, flexDirection: 'row', gap: 30, opacity: 0.4 },
  taglineText: { color: '#FFF', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
});

export default UltraMagicalLoader;