import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  SafeAreaView, StatusBar, Image, Modal, Dimensions, 
  Animated, PanResponder, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');

const NOTIFICATIONS_DATA = [
  { id: '1', type: 'order', title: 'Order Delivered!', message: 'Your YS Ultra Smartwatch Series 9 has been delivered. Enjoy!', time: '2h ago', icon: 'truck-delivery-outline', color: '#3498db' },
  { id: '2', type: 'social', user: '@Amina', message: 'commented: "This watch looks amazing!"', time: '5h ago', avatar: 'https://i.pravatar.cc/150?u=amina' },
  { id: '3', type: 'system', title: 'System Update', message: 'Firmware 2.0.4 is available. Update for better battery.', time: 'Yesterday', icon: 'shield-check-outline', color: '#27ae60' },
];

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // --- UNDO STATE ---
  const [lastDeleted, setLastDeleted] = useState(null);
  const snackbarAnim = useRef(new Animated.Value(100)).current;
  const itemRefs = useRef({});

  // --- MODAL ANIMATION ---
  const panY = useRef(new Animated.Value(0)).current;
  const modalPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => { if (gesture.dy > 0) panY.setValue(gesture.dy); },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 150 || gesture.vy > 0.5) closeModal();
        else Animated.spring(panY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
      },
    })
  ).current;

  const closeModal = () => {
    Animated.timing(panY, { toValue: height, duration: 250, useNativeDriver: true }).start(() => {
      setModalVisible(false);
      panY.setValue(0);
    });
  };

  // --- NOTIFICATION ACTIONS ---
  const deleteNotification = (id) => {
    const itemToDelete = notifications.find(n => n.id === id);
    setLastDeleted(itemToDelete);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Show Snackbar
    showSnackbar();
  };

  const showSnackbar = () => {
    Animated.spring(snackbarAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
    // Auto hide after 3 seconds
    setTimeout(hideSnackbar, 3000);
  };

  const hideSnackbar = () => {
    Animated.timing(snackbarAnim, { toValue: 100, duration: 300, useNativeDriver: true }).start();
  };

  const undoDelete = () => {
    if (lastDeleted) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setNotifications(prev => [lastDeleted, ...prev]);
      setLastDeleted(null);
      hideSnackbar();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const clearAllNotifications = () => {
    if (notifications.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    notifications.forEach((item, index) => {
      setTimeout(() => itemRefs.current[item.id]?.animateOut(), index * 80);
    });

    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setNotifications([]);
    }, notifications.length * 80 + 200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Activity</Text>
          <Text style={styles.headerSub}>Swipe past center to delete</Text>
        </View>
        <TouchableOpacity onPress={clearAllNotifications} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        {['All', 'Mentions'].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {notifications.map((item) => (
          <SwipeableItem 
            key={item.id} 
            ref={ref => itemRefs.current[item.id] = ref}
            item={item} 
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedNotification(item);
                setModalVisible(true);
            }} 
            onDelete={() => deleteNotification(item.id)} 
          />
        ))}
        {notifications.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-outline" size={60} color="#EEE" />
            <Text style={styles.emptyText}>Nothing here yet</Text>
          </View>
        )}
      </ScrollView>

      {/* UNDO SNACKBAR */}
      <Animated.View style={[styles.snackbar, { transform: [{ translateY: snackbarAnim }] }]}>
        <Text style={styles.snackbarText}>Notification deleted</Text>
        <TouchableOpacity onPress={undoDelete}>
          <Text style={styles.undoText}>UNDO</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* MODAL */}
      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: panY }] }]} {...modalPanResponder.panHandlers}>
            <View style={styles.modalHandle} />
            {selectedNotification && (
              <View style={styles.modalBody}>
                <View style={[styles.modalIconBox, {backgroundColor: (selectedNotification.color || '#000') + '10'}]}>
                   {selectedNotification.type === 'social' ? <Image source={{ uri: selectedNotification.avatar }} style={styles.largeAvatar} /> : <MaterialCommunityIcons name={selectedNotification.icon} size={40} color={selectedNotification.color} />}
                </View>
                <Text style={styles.modalTitle}>{selectedNotification.type === 'social' ? selectedNotification.user : selectedNotification.title}</Text>
                <Text style={styles.modalMessage}>{selectedNotification.message}</Text>
                <TouchableOpacity style={styles.actionBtn} onPress={closeModal}><Text style={styles.actionBtnText}>Close</Text></TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- SWIPEABLE COMPONENT ---
const SwipeableItem = React.forwardRef(({ item, onPress, onDelete }, ref) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const hapticTriggered = useRef(false);

  React.useImperativeHandle(ref, () => ({
    animateOut: () => {
      Animated.timing(translateX, { toValue: -width, duration: 300, useNativeDriver: true }).start();
    }
  }));

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          translateX.setValue(gesture.dx);
          if (gesture.dx < -width * 0.5 && !hapticTriggered.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            hapticTriggered.current = true;
          } else if (gesture.dx > -width * 0.5) {
            hapticTriggered.current = false;
          }
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -width * 0.5 || gesture.vx < -1) {
          Animated.spring(translateX, { toValue: -width, useNativeDriver: true, bounciness: 0 }).start(onDelete);
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 150, friction: 12 }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.deleteBackground}><Ionicons name="trash" size={24} color="#FFF" /></View>
      <Animated.View style={[styles.notiCard, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <TouchableOpacity style={styles.innerCard} onPress={onPress} activeOpacity={1}>
          <View style={styles.notiIconContainer}>
            {item.type === 'social' ? <Image source={{ uri: item.avatar }} style={styles.avatar} /> : <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}><MaterialCommunityIcons name={item.icon} size={24} color={item.color} /></View>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.notiTitle}>{item.type === 'social' ? item.user : item.title}</Text>
            <Text style={styles.notiMessage} numberOfLines={1}>{item.message}</Text>
            <Text style={styles.notiTime}>{item.time}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { color: '#888', fontSize: 12 },
  clearBtn: { padding: 5 },
  clearBtnText: { color: '#FF3B30', fontWeight: '700', fontSize: 14 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 15 },
  tab: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, backgroundColor: '#F8F8F8' },
  activeTab: { backgroundColor: '#1A1A1A' },
  tabText: { color: '#666', fontWeight: '700' },
  activeTabText: { color: '#FFF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  swipeContainer: { position: 'relative', marginBottom: 12 },
  deleteBackground: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', backgroundColor: '#FF3B30', borderRadius: 20, justifyContent: 'flex-end', alignItems: 'center', paddingRight: 30 },
  notiCard: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#F5F5F5', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  innerCard: { flexDirection: 'row', padding: 18, alignItems: 'center' },
  notiIconContainer: { marginRight: 15 },
  iconCircle: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  notiTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  notiMessage: { fontSize: 14, color: '#666', marginTop: 4 },
  notiTime: { fontSize: 12, color: '#CCC', marginTop: 8 },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#DDD', fontSize: 18, fontWeight: '600', marginTop: 10 },
  snackbar: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: '#333', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  snackbarText: { color: '#FFF', fontWeight: '500' },
  undoText: { color: '#0A84FF', fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, minHeight: 450 },
  modalHandle: { width: 45, height: 5, backgroundColor: '#E0E0E0', borderRadius: 10, alignSelf: 'center', marginBottom: 25 },
  modalBody: { alignItems: 'center' },
  modalIconBox: { width: 85, height: 85, borderRadius: 42, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  largeAvatar: { width: 85, height: 85, borderRadius: 42 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#1A1A1A' },
  modalMessage: { fontSize: 16, color: '#555', textAlign: 'center', marginVertical: 25, lineHeight: 24 },
  actionBtn: { backgroundColor: '#1A1A1A', paddingHorizontal: 60, paddingVertical: 18, borderRadius: 30 },
  actionBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});

export default NotificationScreen;