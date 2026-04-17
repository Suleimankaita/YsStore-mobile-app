import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');

const THEME = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  softCard: '#F1F5F9',
  border: '#E2E8F0',
  textMain: '#0F172A',
  textSub: '#64748B',
  textLight: '#94A3B8',
  tomato: '#FF6347',
  tomatoSoft: '#FFE7E2',
  skyBlue: '#38BDF8',
  skyBlueSoft: '#E0F2FE',
  success: '#10B981',
  danger: '#EF4444',
  overlay: 'rgba(15, 23, 42, 0.45)',
  dark: '#111827',
};

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    type: 'order',
    title: 'Order Delivered!',
    message: 'Your YS Ultra Smartwatch Series 9 has been delivered. Enjoy!',
    time: '2h ago',
    icon: 'truck-delivery-outline',
    color: '#38BDF8',
    read: false,
  },
  {
    id: '2',
    type: 'social',
    user: '@Amina',
    message: 'commented: "This watch looks amazing!"',
    time: '5h ago',
    avatar: 'https://i.pravatar.cc/150?u=amina',
    read: false,
  },
  {
    id: '3',
    type: 'system',
    title: 'System Update',
    message: 'Firmware 2.0.4 is available. Update for better battery performance.',
    time: 'Yesterday',
    icon: 'shield-check-outline',
    color: '#FF6347',
    read: true,
  },
  {
    id: '4',
    type: 'social',
    user: '@Usman',
    message: 'liked your new store update.',
    time: 'Yesterday',
    avatar: 'https://i.pravatar.cc/150?u=usman',
    read: true,
  },
];

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastDeleted, setLastDeleted] = useState(null);

  const snackbarAnim = useRef(new Animated.Value(120)).current;
  const snackbarTimer = useRef(null);
  const itemRefs = useRef({});
  const panY = useRef(new Animated.Value(height)).current;

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'All') return notifications;
    if (activeTab === 'Mentions') return notifications.filter((item) => item.type === 'social');
    if (activeTab === 'Unread') return notifications.filter((item) => !item.read);
    return notifications;
  }, [activeTab, notifications]);

  useEffect(() => {
    return () => {
      if (snackbarTimer.current) clearTimeout(snackbarTimer.current);
    };
  }, []);

  const openModal = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedNotification(item);
    setModalVisible(true);

    requestAnimationFrame(() => {
      panY.setValue(height);
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 11,
      }).start();
    });

    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    }
  };

  const closeModal = () => {
    Animated.timing(panY, {
      toValue: height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedNotification(null);
    });
  };

  const modalPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 8,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          panY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 140 || gesture.vy > 0.7) {
          closeModal();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  const showSnackbar = () => {
    if (snackbarTimer.current) clearTimeout(snackbarTimer.current);

    Animated.spring(snackbarAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 11,
    }).start();

    snackbarTimer.current = setTimeout(() => {
      hideSnackbar();
    }, 3000);
  };

  const hideSnackbar = () => {
    Animated.timing(snackbarAnim, {
      toValue: 120,
      duration: 240,
      useNativeDriver: true,
    }).start();
  };

  const deleteNotification = (id) => {
    const itemToDelete = notifications.find((item) => item.id === id);
    if (!itemToDelete) return;

    setLastDeleted(itemToDelete);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotifications((prev) => prev.filter((item) => item.id !== id));

    showSnackbar();
  };

  const undoDelete = () => {
    if (!lastDeleted) return;

    if (snackbarTimer.current) clearTimeout(snackbarTimer.current);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setNotifications((prev) => [lastDeleted, ...prev]);
    setLastDeleted(null);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    hideSnackbar();
  };

  const clearAllNotifications = () => {
    if (!notifications.length) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    notifications.forEach((item, index) => {
      setTimeout(() => {
        itemRefs.current[item.id]?.animateOut();
      }, index * 70);
    });

    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setNotifications([]);
      setLastDeleted(null);
    }, notifications.length * 70 + 240);
  };

  const markAllAsRead = () => {
    if (!unreadCount) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />

      <View style={styles.header}>
        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSub}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'Everything is up to date'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={markAllAsRead}
            style={styles.headerIconBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-done-outline" size={18} color={THEME.skyBlue} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearAllNotifications}
            style={styles.headerIconBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={18} color={THEME.tomato} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBadge}>
          <View style={styles.summaryDot} />
          <Text style={styles.summaryBadgeText}>Live Activity</Text>
        </View>

        {unreadCount > 0 && (
          <View style={styles.unreadPill}>
            <Text style={styles.unreadPillText}>{unreadCount} unread</Text>
          </View>
        )}
      </View>

      <View style={styles.tabContainer}>
        {['All', 'Mentions', 'Unread'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, isActive && styles.activeTab]}
              activeOpacity={0.9}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredNotifications.map((item) => (
          <SwipeableItem
            key={item.id}
            ref={(ref) => {
              itemRefs.current[item.id] = ref;
            }}
            item={item}
            onPress={() => openModal(item)}
            onDelete={() => deleteNotification(item.id)}
          />
        ))}

        {filteredNotifications.length === 0 && (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="notifications-off-outline" size={42} color={THEME.skyBlue} />
            </View>
            <Text style={styles.emptyTitle}>No notifications here</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'All'
                ? 'You do not have any notifications yet.'
                : `There is nothing in ${activeTab.toLowerCase()} right now.`}
            </Text>
          </View>
        )}
      </ScrollView>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.snackbar, { transform: [{ translateY: snackbarAnim }] }]}
      >
        <Text style={styles.snackbarText}>Notification deleted</Text>
        <TouchableOpacity onPress={undoDelete} activeOpacity={0.85}>
          <Text style={styles.undoText}>UNDO</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeModal} />
          <Animated.View
            style={[styles.modalContent, { transform: [{ translateY: panY }] }]}
            {...modalPanResponder.panHandlers}
          >
            <View style={styles.modalHandle} />

            {selectedNotification && (
              <View style={styles.modalBody}>
                <View
                  style={[
                    styles.modalIconBox,
                    {
                      backgroundColor:
                        selectedNotification.type === 'social'
                          ? THEME.skyBlueSoft
                          : `${selectedNotification.color || THEME.skyBlue}15`,
                    },
                  ]}
                >
                  {selectedNotification.type === 'social' ? (
                    <Image
                      source={{ uri: selectedNotification.avatar }}
                      style={styles.largeAvatar}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={selectedNotification.icon}
                      size={38}
                      color={selectedNotification.color}
                    />
                  )}
                </View>

                <Text style={styles.modalTitle}>
                  {selectedNotification.type === 'social'
                    ? selectedNotification.user
                    : selectedNotification.title}
                </Text>

                <Text style={styles.modalTime}>{selectedNotification.time}</Text>

                <Text style={styles.modalMessage}>{selectedNotification.message}</Text>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={closeModal}
                  activeOpacity={0.9}
                >
                  <Text style={styles.actionBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const SwipeableItem = React.forwardRef(({ item, onPress, onDelete }, ref) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const hapticTriggered = useRef(false);

  React.useImperativeHandle(ref, () => ({
    animateOut: () => {
      Animated.timing(translateX, {
        toValue: -width,
        duration: 280,
        useNativeDriver: true,
      }).start();
    },
  }));

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          translateX.setValue(gesture.dx);

          if (gesture.dx < -width * 0.42 && !hapticTriggered.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            hapticTriggered.current = true;
          } else if (gesture.dx > -width * 0.42) {
            hapticTriggered.current = false;
          }
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -width * 0.42 || gesture.vx < -0.9) {
          Animated.timing(translateX, {
            toValue: -width,
            duration: 220,
            useNativeDriver: true,
          }).start(onDelete);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 130,
            friction: 12,
          }).start();
        }
      },
    })
  ).current;

  const displayTitle = item.type === 'social' ? item.user : item.title;

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.deleteBackground}>
        <View style={styles.deleteIconCircle}>
          <Ionicons name="trash-outline" size={20} color="#FFF" />
        </View>
        <Text style={styles.deleteLabel}>Delete</Text>
      </View>

      <Animated.View
        style={[styles.notiCard, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.innerCard} onPress={onPress} activeOpacity={0.9}>
          <View style={styles.notiIconContainer}>
            {item.type === 'social' ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.iconCircle, { backgroundColor: `${item.color}15` }]}>
                <MaterialCommunityIcons name={item.icon} size={23} color={item.color} />
              </View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.notiTitle} numberOfLines={1}>
                {displayTitle}
              </Text>
              {!item.read && <View style={styles.unreadDot} />}
            </View>

            <Text style={styles.notiMessage} numberOfLines={2}>
              {item.message}
            </Text>

            <Text style={styles.notiTime}>{item.time}</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={THEME.textLight} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTextBox: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.textMain,
    letterSpacing: -0.5,
  },
  headerSub: {
    color: THEME.textSub,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 16,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.skyBlueSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: THEME.skyBlue,
    marginRight: 8,
  },
  summaryBadgeText: {
    color: THEME.skyBlue,
    fontSize: 12,
    fontWeight: '800',
  },
  unreadPill: {
    backgroundColor: THEME.tomatoSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  unreadPillText: {
    color: THEME.tomato,
    fontSize: 12,
    fontWeight: '800',
  },

  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 14,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  activeTab: {
    backgroundColor: THEME.dark,
    borderColor: THEME.dark,
  },
  tabText: {
    color: THEME.textSub,
    fontWeight: '800',
    fontSize: 13,
  },
  activeTabText: {
    color: '#FFF',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  swipeContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: THEME.tomato,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  deleteIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  deleteLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },

  notiCard: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  innerCard: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  notiIconContainer: {
    marginRight: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: THEME.tomato,
    marginLeft: 8,
  },
  notiTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textMain,
    flexShrink: 1,
  },
  notiMessage: {
    fontSize: 14,
    color: THEME.textSub,
    marginTop: 4,
    lineHeight: 20,
  },
  notiTime: {
    fontSize: 12,
    color: THEME.textLight,
    marginTop: 8,
    fontWeight: '700',
  },

  emptyBox: {
    alignItems: 'center',
    marginTop: 90,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: THEME.skyBlueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: THEME.textMain,
    fontSize: 22,
    fontWeight: '900',
  },
  emptyText: {
    color: THEME.textSub,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 280,
  },

  snackbar: {
    position: 'absolute',
    bottom: 28,
    left: 16,
    right: 16,
    backgroundColor: THEME.dark,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  snackbarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  undoText: {
    color: THEME.skyBlue,
    fontWeight: '900',
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: THEME.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 30,
    minHeight: 420,
  },
  modalHandle: {
    width: 48,
    height: 5,
    backgroundColor: THEME.border,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalBody: {
    alignItems: 'center',
  },
  modalIconBox: {
    width: 92,
    height: 92,
    borderRadius: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  largeAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.textMain,
    textAlign: 'center',
  },
  modalTime: {
    marginTop: 8,
    fontSize: 13,
    color: THEME.skyBlue,
    fontWeight: '800',
  },
  modalMessage: {
    fontSize: 16,
    color: THEME.textSub,
    textAlign: 'center',
    marginVertical: 24,
    lineHeight: 26,
  },
  actionBtn: {
    backgroundColor: THEME.tomato,
    paddingHorizontal: 42,
    paddingVertical: 16,
    borderRadius: 18,
    minWidth: 160,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 15,
  },
});

export default NotificationScreen;