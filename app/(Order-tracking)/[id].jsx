import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

const LAST_ORDER_STORAGE_KEY = '@ysstore_last_order';
const ORDERS_STORAGE_KEY = '@ysstore_orders';

const COLORS = {
  tomato: '#FF6347',
  tomatoSoft: '#FFE6E1',
  sky: '#38BDF8',
  skySoft: '#E0F7FF',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  bg: '#F8FCFF',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  dark: '#111827',
};

const formatCurrency = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

const getStatusMeta = (status) => {
  const s = normalizeStatus(status);

  if (s.includes('delivered')) {
    return {
      bg: COLORS.successSoft,
      color: COLORS.success,
      icon: 'checkmark-circle-outline',
      label: 'Delivered',
    };
  }

  if (s.includes('shipped')) {
    return {
      bg: COLORS.skySoft,
      color: COLORS.sky,
      icon: 'car-outline',
      label: 'Shipped',
    };
  }

  if (s.includes('processing')) {
    return {
      bg: COLORS.warningSoft,
      color: COLORS.warning,
      icon: 'time-outline',
      label: 'Processing',
    };
  }

  if (s.includes('pending')) {
    return {
      bg: COLORS.warningSoft,
      color: COLORS.warning,
      icon: 'hourglass-outline',
      label: 'Pending',
    };
  }

  if (s.includes('cancel')) {
    return {
      bg: COLORS.dangerSoft,
      color: COLORS.danger,
      icon: 'close-circle-outline',
      label: 'Cancelled',
    };
  }

  if (s.includes('paid')) {
    return {
      bg: COLORS.successSoft,
      color: COLORS.success,
      icon: 'card-outline',
      label: 'Paid',
    };
  }

  return {
    bg: COLORS.skySoft,
    color: COLORS.sky,
    icon: 'receipt-outline',
    label: status || 'Unknown',
  };
};

const getTimelineSteps = (status) => {
  const s = normalizeStatus(status);

  const steps = [
    { key: 'pending', title: 'Order Placed', desc: 'Your order has been created.' },
    { key: 'processing', title: 'Processing', desc: 'The store is preparing your order.' },
    { key: 'shipped', title: 'Shipped', desc: 'Your package is on the way.' },
    { key: 'delivered', title: 'Delivered', desc: 'Your order has arrived.' },
  ];

  if (s === 'cancelled') {
    return [
      { key: 'pending', title: 'Order Placed', desc: 'Your order was created.', done: true },
      {
        key: 'cancelled',
        title: 'Cancelled',
        desc: 'This order was cancelled.',
        done: true,
        danger: true,
      },
    ];
  }

  const orderMap = {
    pending: 1,
    paid: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
  };

  const level = orderMap[s] || 1;

  return steps.map((step, index) => ({
    ...step,
    done: index + 1 <= level,
    active: index + 1 === level,
  }));
};

export default function OrderTrackingPage() {
  const params = useLocalSearchParams();
  const orderId = Array.isArray(params?.orderId) ? params.orderId[0] : params?.orderId;
  const mode = Array.isArray(params?.mode) ? params.mode[0] : params?.mode;

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      const storedOrdersRaw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      const storedLastOrderRaw = await AsyncStorage.getItem(LAST_ORDER_STORAGE_KEY);

      const storedOrders = storedOrdersRaw ? JSON.parse(storedOrdersRaw) : [];
      const lastOrder = storedLastOrderRaw ? JSON.parse(storedLastOrderRaw) : null;

      const safeOrders = Array.isArray(storedOrders) ? storedOrders : [];

      let found = null;

      if (orderId) {
        found = safeOrders.find((item) => item.orderId === orderId) || null;
        if (!found && lastOrder?.orderId === orderId) {
          found = lastOrder;
        }
      } else if (lastOrder) {
        found = lastOrder;
      } else if (safeOrders.length > 0) {
        found = safeOrders[0];
      }

      setOrder(found || null);
    } catch (error) {
      setOrder(null);
    } finally {
      setLoadingOrder(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrder();
    setRefreshing(false);
  }, [loadOrder]);

  const persistUpdatedOrder = useCallback(async (updatedOrder) => {
    const storedOrdersRaw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    const safeOrders = storedOrdersRaw ? JSON.parse(storedOrdersRaw) : [];
    const list = Array.isArray(safeOrders) ? safeOrders : [];

    const existingIndex = list.findIndex((item) => item.orderId === updatedOrder.orderId);

    let nextOrders = [...list];

    if (existingIndex >= 0) {
      nextOrders[existingIndex] = updatedOrder;
    } else {
      nextOrders = [updatedOrder, ...nextOrders];
    }

    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
    await AsyncStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(updatedOrder));
    setOrder(updatedOrder);
  }, []);

  const handleConfirmDelivery = useCallback(async () => {
    if (!order) return;

    Alert.alert(
      'Confirm delivery',
      'Mark this order as delivered?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const updated = { ...order, status: 'Delivered' };
            await persistUpdatedOrder(updated);
            Alert.alert('Updated', 'Order marked as delivered.');
          },
        },
      ]
    );
  }, [order, persistUpdatedOrder]);

  const handleCancelOrder = useCallback(async () => {
    if (!order) return;

    Alert.alert(
      'Cancel order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancel order',
          style: 'destructive',
          onPress: async () => {
            const updated = { ...order, status: 'Cancelled' };
            await persistUpdatedOrder(updated);
            Alert.alert('Cancelled', 'Your order has been cancelled.');
          },
        },
      ]
    );
  }, [order, persistUpdatedOrder]);

  const handleCallRider = useCallback(() => {
    Alert.alert('Rider call', 'Connect this button to your phone call or rider contact logic.');
  }, []);

  const handleChatSupport = useCallback(() => {
    router.push('../chart/storecharts/2');
  }, []);

  const statusMeta = useMemo(() => getStatusMeta(order?.status), [order?.status]);
  const timeline = useMemo(() => getTimelineSteps(order?.status), [order?.status]);

  const canCancel = useMemo(() => {
    const s = normalizeStatus(order?.status);
    return s === 'pending' || s === 'paid' || s === 'processing';
  }, [order?.status]);

  const canConfirmDelivery = useMemo(() => {
    return normalizeStatus(order?.status) === 'shipped';
  }, [order?.status]);

  if (loadingOrder) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        <ActivityIndicator size="large" color={COLORS.tomato} />
        <Text style={styles.loaderText}>Loading order details...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.emptyWrap}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

        <View style={styles.emptyIconWrap}>
          <MaterialCommunityIcons
            name="truck-delivery-outline"
            size={42}
            color={COLORS.tomato}
          />
        </View>

        <Text style={styles.emptyTitle}>Order not found</Text>
        <Text style={styles.emptyText}>
          We could not find the order you are trying to track.
        </Text>

        <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/orders')}>
          <Text style={styles.emptyBtnText}>Go to Orders</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {mode === 'details' ? 'Order Details' : 'Track Order'}
          </Text>
          <Text style={styles.headerSub}>{order.orderId}</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/orders')}>
          <Ionicons name="receipt-outline" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.tomato} />
        }
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroTitle}>Order Status</Text>
              <Text style={styles.heroDate}>Placed on {formatDate(order.createdAt)}</Text>
            </View>

            <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
              <Ionicons name={statusMeta.icon} size={14} color={statusMeta.color} />
              <Text style={[styles.statusPillText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tracking Timeline</Text>

          {timeline.map((step, index) => {
            const done = !!step.done;
            const active = !!step.active;
            const danger = !!step.danger;

            const pointBg = danger
              ? COLORS.danger
              : done
              ? COLORS.tomato
              : COLORS.border;

            const lineBg = done ? COLORS.tomato : COLORS.border;

            return (
              <View key={step.key} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelinePoint, { backgroundColor: pointBg }]}>
                    {done ? (
                      <Ionicons
                        name={danger ? 'close' : 'checkmark'}
                        size={12}
                        color={COLORS.white}
                      />
                    ) : null}
                  </View>
                  {index !== timeline.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: lineBg }]} />
                  )}
                </View>

                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      active && { color: COLORS.tomato },
                      danger && { color: COLORS.danger },
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.timelineDesc}>{step.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Method</Text>
            <Text style={styles.infoValue}>{order?.delivery?.title || 'Standard Delivery'}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Estimate</Text>
            <Text style={styles.infoValue}>{order?.delivery?.subtitle || '2 - 3 days'}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>{order.payment}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Items</Text>
            <Text style={styles.infoValue}>{order.itemCount} item(s)</Text>
          </View>
        </View>

        {order.address && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>

            <Text style={styles.addressName}>{order.address.fullName}</Text>
            <Text style={styles.addressText}>{order.address.addressLine}</Text>
            <Text style={styles.addressPhone}>{order.address.phone}</Text>
          </View>
        )}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>

          {(order.items || []).map((item) => (
            <View key={`${order.orderId}-${item.id}`} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemBrand}>{item.brand || 'Store Item'}</Text>
                <Text style={styles.itemQty}>Qty: {item.qty}</Text>
              </View>

              <Text style={styles.itemPrice}>
                {formatCurrency(Number(item.price || 0) * Number(item.qty || 1))}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>{order.orderId}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{order.status}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Amount</Text>
            <Text style={[styles.infoValue, { color: COLORS.tomato, fontWeight: '900' }]}>
              {formatCurrency(order.total)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCallRider}>
            <Ionicons name="call-outline" size={18} color={COLORS.sky} />
            <Text style={styles.actionBtnText}>Call Rider</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleChatSupport}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.tomato} />
            <Text style={[styles.actionBtnText, { color: COLORS.tomato }]}>Chat Support</Text>
          </TouchableOpacity>
        </View>

        {canConfirmDelivery && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmDelivery}>
            <Text style={styles.primaryBtnText}>Confirm Delivery</Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder}>
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
  },

  emptyWrap: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.tomatoSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: COLORS.textDark,
    fontSize: 23,
    fontWeight: '900',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 300,
  },
  emptyBtn: {
    marginTop: 22,
    backgroundColor: COLORS.dark,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 170,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 6 : 10,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: '900',
  },
  headerSub: {
    marginTop: 2,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },

  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroTitle: {
    color: COLORS.textDark,
    fontSize: 18,
    fontWeight: '900',
  },
  heroDate: {
    marginTop: 5,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 10,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  totalValue: {
    color: COLORS.tomato,
    fontSize: 22,
    fontWeight: '900',
  },

  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 14,
  },

  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineLeft: {
    width: 28,
    alignItems: 'center',
  },
  timelinePoint: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 34,
    marginTop: 2,
    marginBottom: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 22,
    paddingLeft: 8,
  },
  timelineTitle: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '800',
  },
  timelineDesc: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },

  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 16,
    flexShrink: 1,
    textAlign: 'right',
  },

  addressName: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  addressText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  addressPhone: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemName: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '800',
  },
  itemBrand: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  itemQty: {
    marginTop: 4,
    color: COLORS.sky,
    fontSize: 12,
    fontWeight: '700',
  },
  itemPrice: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 12,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '800',
  },

  primaryBtn: {
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },

  cancelBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.dangerSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: '900',
  },
});