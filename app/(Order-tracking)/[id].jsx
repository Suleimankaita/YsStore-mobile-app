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
  Linking,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useSelector } from 'react-redux';

import { useUserOrdersQuery } from '../../Features/api/EcomerceSlice';
import { useUpdateOrderStatusMutation } from '../../Features/api/AdminSlice';
import { GetToken, GetUserDetails } from '../../Features/Funcslice';

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

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const normalizeStatus = (status) => {
  const value = String(status || '').trim().toLowerCase();

  if (!value || value === 'pending' || value === 'unpaid') {
    return 'processing';
  }

  return value;
};

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

const normalizeApiOrder = (order) => {
  const rawItems = Array.isArray(order?.item)
    ? order.item
    : Array.isArray(order?.items)
    ? order.items
    : [];

  const items = rawItems.map((product, index) => {
    const productData =
      typeof product?.productId === 'object' && product?.productId !== null
        ? product.productId
        : {};

    const price = Number(
      product?.soldAtPrice ||
        product?.SoldPrice ||
        product?.price ||
        product?.amount ||
        product?.actualPrice ||
        productData?.soldAtPrice ||
        productData?.SoldPrice ||
        productData?.price ||
        productData?.actualPrice ||
        0
    );

    const quantity = Number(product?.quantity || product?.qty || 1);

    return {
      id:
        productData?._id ||
        product?.productId ||
        product?._id ||
        product?.sku ||
        `${order?._id || order?.orderId}-${index}`,
      name:
        product?.ProductName ||
        product?.name ||
        productData?.name ||
        'Product',
      quantity,
      qty: quantity,
      price,
      sku: product?.sku || productData?.sku || 'N/A',
      variant: product?.variant || '',
      brand:
        product?.brand ||
        product?.companyName ||
        productData?.brand ||
        'Store Item',
      image:
        Array.isArray(product?.ProductImg) && product.ProductImg.length > 0
          ? product.ProductImg[0]
          : Array.isArray(productData?.ProductImg) && productData.ProductImg.length > 0
          ? productData.ProductImg[0]
          : product?.image || null,
    };
  });

  const totalAmount = Number(order?.total || order?.totalAmount || 0);

  return {
    rawId: order?._id,
    _id: order?._id,
    orderId: order?.orderId || order?._id,
    createdAt: order?.createdAt,
    updatedAt: order?.updatedAt,
    status: order?.status || 'Processing',
    paymentStatus: order?.paymentStatus || 'N/A',
    payment: order?.paymentStatus || order?.payment || 'N/A',
    deliveryStatus: order?.status || 'Processing',
    deliveryAddress:
      order?.customer?.address ||
      order?.Customer?.address ||
      order?.address?.addressLine ||
      order?.address ||
      'N/A',
    address: {
      fullName: order?.customer?.name || order?.Customer?.name || 'Guest',
      phone: order?.customer?.phone || order?.Customer?.phone || 'N/A',
      addressLine:
        order?.customer?.address ||
        order?.Customer?.address ||
        order?.address?.addressLine ||
        order?.address ||
        'N/A',
    },
    delivery: {
      title: order?.delivery?.title || 'Standard Delivery',
      subtitle: order?.delivery?.subtitle || '2 - 3 days',
      fee: Number(order?.shippingCost || order?.delivery?.fee || 0),
    },
    shippingCost: Number(order?.shippingCost || 0),
    tax: Number(order?.tax || 0),
    totalAmount,
    total: totalAmount,
    itemCount: items.length,
    trackingId: order?._id ? order._id.slice(0, 8).toUpperCase() : 'N/A',
    riderPhone:
      order?.rider?.phone ||
      order?.delivery?.riderPhone ||
      order?.deliveryRider?.phone ||
      null,
    storeChatId:
      order?.companyId?.[0] ||
      order?.companyId ||
      order?.storeId ||
      order?.branchId?.[0] ||
      '2',
    customer: {
      name: order?.customer?.name || order?.Customer?.name || 'Guest',
      email: order?.customer?.email || order?.Customer?.email || 'N/A',
      phone: order?.customer?.phone || order?.Customer?.phone || 'N/A',
    },
    items,
  };
};

const getTimelineSteps = (status) => {
  const s = normalizeStatus(status);

  const steps = [
    {
      key: 'placed',
      title: 'Order Placed',
      desc: 'Your order has been created.',
    },
    {
      key: 'processing',
      title: 'Processing',
      desc: 'The store is preparing your order.',
    },
    {
      key: 'shipped',
      title: 'Shipped',
      desc: 'Your package is on the way.',
    },
    {
      key: 'delivered',
      title: 'Delivered',
      desc: 'Your order has arrived.',
    },
  ];

  if (s === 'cancelled') {
    return [
      {
        key: 'placed',
        title: 'Order Placed',
        desc: 'Your order was created.',
        done: true,
      },
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
    processing: 2,
    paid: 2,
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
  const token = useSelector(GetToken);
  const userDetails = useSelector(GetUserDetails);
  const userId = userDetails?.id || userDetails?._id;

  const [updateOrderStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();

  const {
    data,
    isFetching,
    refetch,
  } = useUserOrdersQuery(
    { token, id: userId },
    {
      skip: !token || !userId,
      pollingInterval: 5000,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const params = useLocalSearchParams();

  const orderId = Array.isArray(params?.orderId)
    ? params.orderId[0]
    : params?.orderId;

  const mode = Array.isArray(params?.mode)
    ? params.mode[0]
    : params?.mode;

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const apiOrders = useMemo(() => {
    if (!data?.success || !Array.isArray(data?.data)) {
      return [];
    }

    return data.data.map(normalizeApiOrder);
  }, [data]);

  const persistUpdatedOrder = useCallback(async (updatedOrder) => {
    const storedOrdersRaw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    const safeOrders = storedOrdersRaw ? JSON.parse(storedOrdersRaw) : [];
    const list = Array.isArray(safeOrders) ? safeOrders : [];

    const existingIndex = list.findIndex(
      (item) => String(item.orderId) === String(updatedOrder.orderId)
    );

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

  const findLocalOrder = useCallback(async () => {
    const storedOrdersRaw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    const storedLastOrderRaw = await AsyncStorage.getItem(LAST_ORDER_STORAGE_KEY);

    const storedOrders = storedOrdersRaw ? JSON.parse(storedOrdersRaw) : [];
    const lastOrder = storedLastOrderRaw ? JSON.parse(storedLastOrderRaw) : null;

    const safeOrders = Array.isArray(storedOrders) ? storedOrders : [];

    let found = null;

    if (orderId) {
      found =
        safeOrders.find((item) => String(item.orderId) === String(orderId)) ||
        safeOrders.find((item) => String(item.trackingId) === String(orderId)) ||
        null;

      if (!found && String(lastOrder?.orderId) === String(orderId)) {
        found = lastOrder;
      }
    } else if (lastOrder) {
      found = lastOrder;
    } else if (safeOrders.length > 0) {
      found = safeOrders[0];
    }

    return found;
  }, [orderId]);

  const loadOrder = useCallback(async () => {
    try {
      setLoadingOrder(true);

      let found =
        apiOrders.find((item) => String(item.orderId) === String(orderId)) ||
        apiOrders.find((item) => String(item.trackingId) === String(orderId)) ||
        null;

      if (found) {
        await persistUpdatedOrder(found);
      }

      if (!found) {
        found = await findLocalOrder();
      }

      setOrder(found || null);
    } catch (error) {
      setOrder(null);
    } finally {
      setLoadingOrder(false);
    }
  }, [apiOrders, orderId, findLocalOrder, persistUpdatedOrder]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await refetch();
      await loadOrder();
    } catch (error) {
      Alert.alert('Refresh failed', 'Unable to refresh order details.');
    }

    setRefreshing(false);
  }, [refetch, loadOrder]);

  const updateStatus = useCallback(
    async (newStatus) => {
      if (!order) return;

      const title = newStatus === 'Delivered' ? 'Confirm delivery' : 'Cancel order';

      const message =
        newStatus === 'Delivered'
          ? 'Mark this order as delivered?'
          : 'Are you sure you want to cancel this order?';

      Alert.alert(title, message, [
        { text: 'No', style: 'cancel' },
        {
          text: newStatus === 'Delivered' ? 'Confirm' : 'Cancel Order',
          style: newStatus === 'Cancelled' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (order._id || order.rawId) {
                await updateOrderStatus({
                  id: order._id || order.rawId,
                  status: newStatus,
                  paymentStatus:
                    newStatus === 'Delivered' ? 'Paid' : order.paymentStatus || 'Paid',
                  token,
                }).unwrap();
              }

              const updated = {
                ...order,
                status: newStatus,
                deliveryStatus: newStatus,
                paymentStatus: newStatus === 'Delivered' ? 'Paid' : order.paymentStatus,
              };

              await persistUpdatedOrder(updated);

              Alert.alert('Updated', `Order updated to ${newStatus}.`);
              refetch();
            } catch (error) {
              Alert.alert(
                'Update failed',
                error?.data?.message || 'Could not update this order.'
              );
            }
          },
        },
      ]);
    },
    [order, token, updateOrderStatus, persistUpdatedOrder, refetch]
  );

  const handleCallRider = useCallback(async () => {
    const phone = order?.riderPhone;

    if (!phone) {
      Alert.alert('No rider phone', 'Rider contact is not available for this order yet.');
      return;
    }

    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert('Call failed', 'Your device cannot start a phone call.');
      return;
    }

    Linking.openURL(url);
  }, [order]);

  const handleChatSupport = useCallback(() => {
    const chatId = order?.storeChatId || '2';
    router.push(`../chart/storecharts/${chatId}`);
  }, [order]);

  const handleShareOrder = useCallback(async () => {
    if (!order) return;

    try {
      await Share.share({
        message:
          `YsStore Order\n` +
          `Order ID: ${order.orderId}\n` +
          `Tracking ID: ${order.trackingId || 'N/A'}\n` +
          `Amount: ${formatCurrency(order.totalAmount || order.total)}\n` +
          `Status: ${order.status}\n` +
          `Payment: ${order.paymentStatus || order.payment}`,
      });
    } catch (error) {
      Alert.alert('Share failed', 'Unable to share this order.');
    }
  }, [order]);

  const statusMeta = useMemo(() => getStatusMeta(order?.status), [order?.status]);
  const timeline = useMemo(() => getTimelineSteps(order?.status), [order?.status]);

  const canCancel = useMemo(() => {
    const s = normalizeStatus(order?.status);
    return s === 'processing' || s === 'paid';
  }, [order?.status]);

  const canConfirmDelivery = useMemo(() => {
    return normalizeStatus(order?.status) === 'shipped';
  }, [order?.status]);

  const totalAmount = Number(order?.totalAmount || order?.total || 0);
  const items = Array.isArray(order?.items) ? order.items : [];

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
          <MaterialCommunityIcons name="truck-delivery-outline" size={42} color={COLORS.tomato} />
        </View>

        <Text style={styles.emptyTitle}>Order not found</Text>

        <Text style={styles.emptyText}>
          We could not find this order. Go back to your orders and try again.
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
          <Text style={styles.headerSub}>
            #{order.orderId}
            {isFetching ? ' • Syncing...' : ''}
          </Text>
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
            <View style={{ flex: 1 }}>
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
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
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
              <View key={`${step.key}-${index}`} style={styles.timelineRow}>
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
            <Text style={styles.infoValue}>
              {order?.delivery?.title || 'Standard Delivery'}
            </Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Estimate</Text>
            <Text style={styles.infoValue}>
              {order?.delivery?.subtitle || '2 - 3 days'}
            </Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>
              {order.paymentStatus || order.payment || 'N/A'}
            </Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Tracking ID</Text>
            <Text style={styles.infoValue}>{order.trackingId || 'N/A'}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Items</Text>
            <Text style={styles.infoValue}>
              {items.length || order.itemCount || 0} item(s)
            </Text>
          </View>
        </View>

        {!!order.address && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>

            <Text style={styles.addressName}>
              {order.address.fullName || order.customer?.name || 'Guest'}
            </Text>
            <Text style={styles.addressText}>
              {order.address.addressLine || order.deliveryAddress || 'N/A'}
            </Text>
            <Text style={styles.addressPhone}>
              {order.address.phone || order.customer?.phone || 'N/A'}
            </Text>
          </View>
        )}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>

          {items.length > 0 ? (
            items.map((item, index) => {
              const quantity = Number(item.quantity || item.qty || 1);
              const price = Number(item.price || 0);

              return (
                <View key={`${order.orderId}-${item.id || index}`} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemBrand}>{item.brand || 'Store Item'}</Text>
                    <Text style={styles.itemQty}>Qty: {quantity}</Text>
                  </View>

                  <Text style={styles.itemPrice}>{formatCurrency(price * quantity)}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptySmallText}>No items found for this order.</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>#{order.orderId}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{order.status}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Shipping</Text>
            <Text style={styles.infoValue}>{formatCurrency(order.shippingCost)}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Tax</Text>
            <Text style={styles.infoValue}>{formatCurrency(order.tax)}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Amount</Text>
            <Text style={[styles.infoValue, { color: COLORS.tomato, fontWeight: '900' }]}>
              {formatCurrency(totalAmount)}
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
            <Text style={[styles.actionBtnText, { color: COLORS.tomato }]}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShareOrder}>
            <Ionicons name="share-social-outline" size={18} color={COLORS.success} />
            <Text style={[styles.actionBtnText, { color: COLORS.success }]}>Share</Text>
          </TouchableOpacity>
        </View>

        {canConfirmDelivery && (
          <TouchableOpacity
            style={styles.primaryBtn}
            disabled={updating}
            onPress={() => updateStatus('Delivered')}
          >
            <Text style={styles.primaryBtnText}>
              {updating ? 'Updating...' : 'Confirm Delivery'}
            </Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity
            style={styles.cancelBtn}
            disabled={updating}
            onPress={() => updateStatus('Cancelled')}
          >
            <Text style={styles.cancelBtnText}>
              {updating ? 'Updating...' : 'Cancel Order'}
            </Text>
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
  emptySmallText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 190,
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
    gap: 12,
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