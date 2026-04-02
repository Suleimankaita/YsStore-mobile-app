import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Animated,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const getTheme = (isDark) => {
  return {
    primary: '#0369A1',
    bg: isDark ? '#0F172A' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F8FAFC' : '#0F172A',
    subText: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
    red: '#EF4444',
    green: '#22C55E',
    accent: '#38BDF8',
  };
};

// --- Reusable Animated Button ---
const AnimatedButton = ({ children, onPress, style }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scaleValue, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleValue, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// --- Animated Activity Chart Component ---
const ActivityChart = ({ theme }) => {
  const data = [40, 70, 45, 90, 65, 80, 50];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const animations = data.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    const sequence = animations.map((anim, index) => 
      Animated.spring(anim, { toValue: data[index], tension: 20, friction: 4, useNativeDriver: false })
    );
    Animated.stagger(100, sequence).start();
  }, []);

  return (
    <View style={[styles.chartContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>Weekly Views</Text>
        <View style={styles.growthBadge}><Text style={styles.growthText}>+12%</Text></View>
      </View>
      <View style={styles.chartBarsArea}>
        {data.map((val, i) => (
          <View key={i} style={styles.barWrapper}>
            <Animated.View 
              style={[
                styles.bar, 
                { height: animations[i], backgroundColor: i === 3 ? theme.primary : theme.accent + '40' }
              ]} 
            />
            <Text style={[styles.barLabel, { color: theme.subText }]}>{days[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function PremiumMenuScreen() {
  // Using a fixed dark/light mode toggle for this example, 
  // or you can use useColorScheme() from 'react-native'
  const isDark = false; 
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  const [isLogoutVisible, setLogoutVisible] = useState(false);
  const modalY = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const listSildeAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(listSildeAnim, { toValue: 0, tension: 20, useNativeDriver: true })
    ]).start();
  }, []);

  const toggleLogoutModal = (show) => {
    if (show) {
      setLogoutVisible(true);
      Animated.timing(modalY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    } else {
      Animated.timing(modalY, { toValue: height, duration: 300, useNativeDriver: true }).start(() => setLogoutVisible(false));
    }
  };

  const ListItem = ({ icon, title, badge, extra, color }) => (
    <AnimatedButton style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.listLeft}>
        <View style={[styles.listIconCircle, { backgroundColor: (color || theme.subText) + '15' }]}>
          <Ionicons name={icon} size={20} color={color || theme.subText} />
        </View>
        <Text style={[styles.listTitle, { color: theme.text }]}>{title}</Text>
      </View>
      <View style={styles.listRight}>
        {badge && <View style={[styles.badge, { backgroundColor: theme.primary }]}><Text style={styles.badgeText}>{badge}</Text></View>}
        {extra && <Text style={[styles.extraText, { color: theme.subText }]}>{extra}</Text>}
        <Ionicons name="chevron-forward" size={16} color={theme.border} />
      </View>
    </AnimatedButton>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.headerBg, { backgroundColor: theme.primary }]} />
      
      <View style={styles.headerNav}>
        <TouchableOpacity><Ionicons name="chevron-back" size={28} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity><Ionicons name="qr-code-outline" size={24} color="white" /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* User Profile Card */}
        <Animated.View style={[styles.userCard, { backgroundColor: theme.card, opacity: fadeAnim }]}>
          <View style={styles.userRow}>
            <View>
              <Image source={{ uri: 'https://i.pravatar.cc/150?u=john' }} style={[styles.avatar, { borderColor: theme.bg }]} />
              <View style={[styles.activeDot, { backgroundColor: theme.green, borderColor: theme.card }]} />
            </View>
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { color: theme.text }]}>John Adam</Text>
                <View style={styles.proBadge}><Text style={styles.proText}>GOLD</Text></View>
              </View>
              <Text style={[styles.userPhone, { color: theme.subText }]}>@john_creative</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={[styles.statsContainer, { backgroundColor: theme.bg + '50' }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text }]}>12.8K</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>Followers</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text }]}>842</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>Following</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text }]}>45.2K</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>Viewers</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.viewProfileLine, { borderTopColor: theme.border }]}>
            <Text style={[styles.viewProfileText, { color: theme.primary }]}>Edit Professional Profile</Text>
            <Ionicons name="arrow-forward" size={14} color={theme.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Insights & Lists */}
        <Animated.View style={[styles.listContainer, { transform: [{ translateY: listSildeAnim }] }]}>
          <Text style={[styles.sectionLabel, { color: theme.subText }]}>Insights</Text>
          
          <ActivityChart theme={theme} />

          <ListItem icon="notifications-outline" title="Notifications" badge="4" color="#0EA5E9" />
          <ListItem icon="heart-outline" title="Favorites" extra="12 items" color="#EF4444" />
          
          <Text style={[styles.sectionLabel, { marginTop: 25, color: theme.subText }]}>Settings</Text>
          <ListItem icon="shield-checkmark-outline" title="Privacy & Security" />
          <ListItem icon="color-palette-outline" title="Appearance" extra="Light Mode" />

          <AnimatedButton onPress={() => toggleLogoutModal(true)} style={[styles.logoutItem, { backgroundColor: theme.red + '10', borderColor: theme.red + '20' }]}>
            <View style={styles.logoutIcon}>
              <Ionicons name="log-out-outline" size={22} color={theme.red} />
            </View>
            <Text style={[styles.logoutText, { color: theme.red }]}>Sign Out</Text>
          </AnimatedButton>
        </Animated.View>
      </ScrollView>

      {/* Logout Animated Sheet */}
      <Modal visible={isLogoutVisible} transparent animationType="none">
        <Pressable style={styles.modalOverlay} onPress={() => toggleLogoutModal(false)}>
          <Animated.View style={[styles.bottomSheet, { backgroundColor: theme.card, transform: [{ translateY: modalY }] }]}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
            <View style={styles.modalContent}>
              <View style={[styles.logoutGraphic, { backgroundColor: theme.red + '10' }]}>
                <Ionicons name="alert-circle" size={50} color={theme.red} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Signing out?</Text>
              <Text style={[styles.modalSub, { color: theme.subText }]}>You’ll miss out on your daily personalized offers and flash sale alerts.</Text>
              
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: theme.red }]} onPress={() => setLogoutVisible(false)}>
                <Text style={styles.confirmBtnText}>Yes, Logout</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={() => toggleLogoutModal(false)}>
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Stay Logged In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBg: { position: 'absolute', top: 0, width: '100%', height: 260, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 40, marginBottom: 20 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
  
  userCard: { marginHorizontal: 20, borderRadius: 28, padding: 20, elevation: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 3 },
  activeDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  userInfo: { flex: 1, marginLeft: 15 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 18, fontWeight: '800' },
  proBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  proText: { color: '#D97706', fontSize: 10, fontWeight: '900' },
  userPhone: { fontSize: 13, marginTop: 4 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, paddingVertical: 15, borderRadius: 20 },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 16, fontWeight: '900' },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, height: '60%', alignSelf: 'center' },

  viewProfileLine: { flexDirection: 'row', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1 },
  viewProfileText: { fontWeight: '700', fontSize: 13, marginRight: 5 },

  chartContainer: { padding: 18, borderRadius: 24, marginBottom: 15, borderWidth: 1 },
  chartTitle: { fontSize: 14, fontWeight: '800' },
  growthBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  growthText: { color: '#16A34A', fontSize: 10, fontWeight: '900' },
  chartBarsArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  barWrapper: { alignItems: 'center', width: '10%' },
  bar: { width: 8, borderRadius: 4, marginBottom: 8 },
  barLabel: { fontSize: 10, fontWeight: '700' },

  listContainer: { paddingHorizontal: 20, marginTop: 35 },
  sectionLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, marginLeft: 5 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 20, marginBottom: 10, borderWidth: 1 },
  listLeft: { flexDirection: 'row', alignItems: 'center' },
  listIconCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  listTitle: { fontSize: 15, fontWeight: '600', marginLeft: 12 },
  listRight: { flexDirection: 'row', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 8 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  extraText: { fontSize: 12, marginRight: 8, fontWeight: '600' },

  logoutItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginTop: 20, borderWidth: 1 },
  logoutIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  logoutText: { fontSize: 16, fontWeight: '800', marginLeft: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, paddingBottom: 40 },
  handle: { width: 40, height: 5, borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
  modalContent: { alignItems: 'center' },
  logoutGraphic: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10 },
  modalSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 30, paddingHorizontal: 20 },
  confirmBtn: { width: '100%', padding: 18, borderRadius: 20, alignItems: 'center', marginBottom: 12 },
  confirmBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
  cancelBtn: { width: '100%', padding: 18, borderRadius: 20, alignItems: 'center', borderWidth: 1 },
  cancelBtnText: { fontSize: 16, fontWeight: '700' },
});