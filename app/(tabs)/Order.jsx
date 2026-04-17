import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  Share,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';

const { width } = Dimensions.get('window');
const LAST_ORDER_STORAGE_KEY = '@ysstore_last_order';

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
  dark: '#111827',
  warning: '#F59E0B',
};

const formatCurrency = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

export default function OrderSuccessPage() {
  const params = useLocalSearchParams();

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const routeOrderId = params?.orderId;
        const routeTotal = params?.total;
        const routePayment = params?.payment;

        if (routeOrderId || routeTotal || routePayment) {
          const stored = await AsyncStorage.getItem(LAST_ORDER_STORAGE_KEY);
          const parsedStored = stored ? JSON.parse(stored) : null;

          setOrder({
            orderId: routeOrderId || parsedStored?.orderId || `YS-${Date.now()}`,
            total: Number(routeTotal || parsedStored?.total || 0),
            payment:
              routePayment ||
              parsedStored?.payment?.title ||
              parsedStored?.payment ||
              'Paystack',
            status: parsedStored?.status || 'Processing',
            itemCount: parsedStored?.itemCount || 0,
            delivery: parsedStored?.delivery || null,
            address: parsedStored?.address || null,
            createdAt: parsedStored?.createdAt || new Date().toISOString(),
          });
        } else {
          const stored = await AsyncStorage.getItem(LAST_ORDER_STORAGE_KEY);
          const parsedStored = stored ? JSON.parse(stored) : null;

          if (parsedStored) {
            setOrder({
              orderId: parsedStored.orderId,
              total: Number(parsedStored.total || 0),
              payment: parsedStored?.payment?.title || parsedStored?.payment || 'Paystack',
              status: parsedStored.status || 'Processing',
              itemCount: parsedStored.itemCount || 0,
              delivery: parsedStored.delivery || null,
              address: parsedStored.address || null,
              createdAt: parsedStored.createdAt || new Date().toISOString(),
            });
          } else {
            setOrder(null);
          }
        }
      } catch (error) {
        setOrder(null);
      } finally {
        setLoadingOrder(false);
      }
    };

    loadOrder();
  }, [params]);

  const statusColor = useMemo(() => {
    if (!order?.status) return COLORS.success;

    const normalized = String(order.status).toLowerCase();

    if (normalized.includes('paid')) return COLORS.success;
    if (normalized.includes('processing')) return COLORS.warning;
    if (normalized.includes('pending')) return COLORS.warning;
    return COLORS.success;
  }, [order?.status]);

  const handleShareOrder = async () => {
    if (!order) return;

    try {
      await Share.share({
        message: `My YsStore order was placed successfully.\nOrder ID: ${order.orderId}\nAmount: ${formatCurrency(order.total)}\nPayment: ${order.payment}`,
      });
    } catch (error) {
      Alert.alert('Share failed', 'Unable to share order details.');
    }
  };

  const handleViewOrders = () => {
    router.push('/orders');
  };

  const handleTrackOrder = () => {
    if (!order?.orderId) {
      Alert.alert('Order unavailable', 'Order details are not available yet.');
      return;
    }

    router.push({
      pathname: '/order-tracking',
      params: {
        orderId: order.orderId,
      },
    });
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (loadingOrder) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.tomato} />
        <ActivityIndicator size="large" color={COLORS.tomato} />
        <Text style={styles.loaderText}>Loading order details...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

        <View style={styles.emptyIconWrap}>
          <Ionicons name="receipt-outline" size={42} color={COLORS.tomato} />
        </View>

        <Text style={styles.emptyTitle}>No recent order found</Text>
        <Text style={styles.emptyText}>
          We could not find an order record to display here.
        </Text>

        <TouchableOpacity style={styles.emptyBtn} onPress={handleGoHome}>
          <Text style={styles.emptyBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tomato} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={[COLORS.tomato, COLORS.sky]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.topGradient}
        >
          <TouchableOpacity style={styles.shareBtn} onPress={handleShareOrder}>
            <Ionicons name="share-social-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <Ionicons name="checkmark" size={44} color={COLORS.success} />
            </View>
          </View>

          <Text style={styles.successTitle}>Order Placed Successfully</Text>
          <Text style={styles.successSubTitle}>
            Your order has been received and is now being processed.
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Order ID</Text>
              <Text style={styles.value}>{order.orderId}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.label}>Amount Paid</Text>
              <Text style={styles.valueTomato}>{formatCurrency(order.total)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.label}>Payment Method</Text>
              <Text style={styles.value}>{order.payment}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.label}>Items</Text>
              <Text style={styles.value}>{order.itemCount} item(s)</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.label}>Delivery Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {order.status}
                </Text>
              </View>
            </View>
          </View>

          {order.address && (
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="location-outline" size={24} color={COLORS.tomato} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Delivery Address</Text>
                <Text style={styles.infoText}>{order.address.fullName}</Text>
                <Text style={styles.infoText}>{order.address.addressLine}</Text>
                <Text style={styles.infoText}>{order.address.phone}</Text>
              </View>
            </View>
          )}

          {order.delivery && (
            <View style={styles.infoCard}>
              <View style={[styles.infoIconWrap, { backgroundColor: COLORS.skySoft }]}>
                <MaterialCommunityIcons
                  name="truck-delivery-outline"
                  size={24}
                  color={COLORS.sky}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Delivery Method</Text>
                <Text style={styles.infoText}>{order.delivery.title}</Text>
                <Text style={styles.infoText}>{order.delivery.subtitle}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoCard}>
            <View style={[styles.infoIconWrap, { backgroundColor: COLORS.skySoft }]}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.sky} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Stay Updated</Text>
              <Text style={styles.infoText}>
                Check your notifications and orders page for live order updates.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleViewOrders}
          activeOpacity={0.9}
        >
          <Ionicons name="receipt-outline" size={18} color={COLORS.white} />
          <Text style={styles.primaryBtnText}>View My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleTrackOrder}
          activeOpacity={0.9}
        >
          <Ionicons name="locate-outline" size={18} color={COLORS.tomato} />
          <Text style={styles.secondaryBtnText}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={handleContinueShopping}
          activeOpacity={0.9}
        >
          <Text style={styles.ghostBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
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

  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.tomatoSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    color: COLORS.textDark,
    fontSize: 22,
    fontWeight: '900',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    maxWidth: 300,
  },
  emptyBtn: {
    marginTop: 22,
    backgroundColor: COLORS.tomato,
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
    paddingBottom: 210,
  },

  topGradient: {
    paddingTop: 26,
    paddingHorizontal: 20,
    paddingBottom: 38,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    position: 'relative',
  },
  shareBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 18 : 22,
    right: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  iconCircleOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircleInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  successTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
  },
  successSubTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 320,
    opacity: 0.96,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  value: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '800',
    maxWidth: width * 0.42,
    textAlign: 'right',
  },
  valueTomato: {
    fontSize: 16,
    color: COLORS.tomato,
    fontWeight: '900',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },

  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.tomatoSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  bottomActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    paddingTop: 14,
    backgroundColor: COLORS.bg,
  },

  primaryBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.dark,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },

  secondaryBtn: {
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.tomatoSoft,
    borderWidth: 1,
    borderColor: '#FFD2C7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  secondaryBtnText: {
    color: COLORS.tomato,
    fontSize: 15,
    fontWeight: '800',
  },

  ghostBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostBtnText: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '800',
  },
});