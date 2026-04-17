import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const LAST_ORDER_STORAGE_KEY = '@ysstore_last_order';
const ORDERS_STORAGE_KEY = '@ysstore_orders';
const CART_STORAGE_KEY = '@ysstore_cart';

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

const ORDER_TABS = [
  'All',
  'Pending',
  'Paid',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const FALLBACK_ORDERS = [
  {
    orderId: 'YS-100200300',
    total: 82000,
    payment: 'Paystack',
    status: 'Processing',
    itemCount: 2,
    createdAt: new Date().toISOString(),
    delivery: { title: 'Standard Delivery', subtitle: '2 - 3 days', fee: 3500 },
    address: {
      fullName: 'Suleiman Yusuf',
      phone: '+234 800 000 0000',
      addressLine: 'No 2 Kankara Road, Katsina State, Nigeria',
    },
    items: [
      { id: '1', name: 'Wireless Bluetooth Headset', qty: 1, price: 18500, brand: 'YsStore HQ' },
      { id: '2', name: 'Smart Wrist Watch Pro', qty: 1, price: 32000, brand: 'Fashion Hub' },
    ],
  },
  {
    orderId: 'YS-100200301',
    total: 125000,
    payment: 'Cash on Delivery',
    status: 'Pending',
    itemCount: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    delivery: { title: 'Express Delivery', subtitle: 'Same day / next day', fee: 7000 },
    address: {
      fullName: 'Suleiman Yusuf',
      phone: '+234 811 111 1111',
      addressLine: 'Custom Market Road, Abuja, Nigeria',
    },
    items: [
      { id: '7', name: 'Sky Max Android Phone', qty: 1, price: 125000, brand: 'YsStore Official' },
    ],
  },
  {
    orderId: 'YS-100200302',
    total: 45000,
    payment: 'Wallet',
    status: 'Delivered',
    itemCount: 1,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    delivery: { title: 'Store Pickup', subtitle: 'Pick up from store branch', fee: 0 },
    address: {
      fullName: 'Suleiman Yusuf',
      phone: '+234 800 000 0000',
      addressLine: 'No 2 Kankara Road, Katsina State, Nigeria',
    },
    items: [
      { id: '3', name: 'Fast Charge Power Bank', qty: 1, price: 17000, brand: 'Accessory Hub' },
    ],
  },
];

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

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const persistOrders = useCallback(async (nextOrders) => {
    try {
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
    } catch (error) {
      console.log('Failed to persist orders:', error);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const storedOrders = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      const storedLastOrder = await AsyncStorage.getItem(LAST_ORDER_STORAGE_KEY);

      let parsedOrders = storedOrders ? JSON.parse(storedOrders) : [];
      const parsedLastOrder = storedLastOrder ? JSON.parse(storedLastOrder) : null;

      if (!Array.isArray(parsedOrders) || parsedOrders.length === 0) {
        parsedOrders = FALLBACK_ORDERS;
      }

      if (parsedLastOrder?.orderId) {
        const exists = parsedOrders.some((item) => item.orderId === parsedLastOrder.orderId);
        if (!exists) {
          parsedOrders = [parsedLastOrder, ...parsedOrders];
        }
      }

      parsedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(parsedOrders);
      await persistOrders(parsedOrders);
    } catch (error) {
      setOrders(FALLBACK_ORDERS);
      await persistOrders(FALLBACK_ORDERS);
    } finally {
      setLoadingOrders(false);
    }
  }, [persistOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (selectedTab !== 'All') {
      list = list.filter((item) => normalizeStatus(item.status) === normalizeStatus(selectedTab));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((item) => {
        const orderId = String(item.orderId || '').toLowerCase();
        const payment = String(item.payment || '').toLowerCase();
        const itemNames = Array.isArray(item.items)
          ? item.items.map((x) => x.name).join(' ').toLowerCase()
          : '';
        return orderId.includes(q) || payment.includes(q) || itemNames.includes(q);
      });
    }

    return list;
  }, [orders, search, selectedTab]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      active: orders.filter((o) => {
        const s = normalizeStatus(o.status);
        return s === 'pending' || s === 'paid' || s === 'processing' || s === 'shipped';
      }).length,
      delivered: orders.filter((o) => normalizeStatus(o.status) === 'delivered').length,
    };
  }, [orders]);

  const updateOrderStatus = useCallback(
    async (orderId, nextStatus) => {
      const nextOrders = orders.map((item) =>
        item.orderId === orderId ? { ...item, status: nextStatus } : item
      );
      setOrders(nextOrders);
      await persistOrders(nextOrders);
    },
    [orders, persistOrders]
  );

  const deleteOrder = useCallback(
    (orderId) => {
      Alert.alert('Delete order', 'Remove this order from your history?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const nextOrders = orders.filter((item) => item.orderId !== orderId);
            setOrders(nextOrders);
            await persistOrders(nextOrders);
          },
        },
      ]);
    },
    [orders, persistOrders]
  );

  const cancelOrder = useCallback(
    (order) => {
      Alert.alert(
        'Cancel order',
        `Are you sure you want to cancel ${order.orderId}?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Cancel Order',
            style: 'destructive',
            onPress: async () => {
              await updateOrderStatus(order.orderId, 'Cancelled');
              Alert.alert('Order cancelled', 'Your order has been cancelled.');
            },
          },
        ]
      );
    },
    [updateOrderStatus]
  );

  const markAsDelivered = useCallback(
    async (order) => {
      await updateOrderStatus(order.orderId, 'Delivered');
      Alert.alert('Order updated', 'This order is now marked as delivered.');
    },
    [updateOrderStatus]
  );

  const reorderItems = useCallback(async (order) => {
    try {
      const currentCartRaw = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const currentCart = currentCartRaw ? JSON.parse(currentCartRaw) : [];
      const safeCart = Array.isArray(currentCart) ? currentCart : [];

      const merged = [...safeCart];

      (order.items || []).forEach((item) => {
        const existingIndex = merged.findIndex((x) => x.id === item.id);
        if (existingIndex >= 0) {
          merged[existingIndex] = {
            ...merged[existingIndex],
            qty: Number(merged[existingIndex].qty || 1) + Number(item.qty || 1),
          };
        } else {
          merged.push({
            id: item.id,
            name: item.name,
            brand: item.brand || 'Store Item',
            price: Number(item.price || 0),
            qty: Number(item.qty || 1),
            image: item.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
          });
        }
      });

      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(merged));
      Alert.alert('Reorder successful', 'Items have been added to your cart.', [
        { text: 'Stay here', style: 'cancel' },
        {
          text: 'Open cart',
          onPress: () => router.push('/(Cart)/Cart'),
        },
      ]);
    } catch (error) {
      Alert.alert('Reorder failed', 'Could not add items back to cart.');
    }
  }, []);

  const shareOrder = useCallback(async (order) => {
    try {
      await Share.share({
        message: `YsStore Order\nOrder ID: ${order.orderId}\nAmount: ${formatCurrency(order.total)}\nStatus: ${order.status}\nPayment: ${order.payment}`,
      });
    } catch (error) {
      Alert.alert('Share failed', 'Unable to share this order.');
    }
  }, []);

  const openTracking = useCallback((order) => {
    router.push({
      pathname: '/(Order-tracking)/2',
      params: {
        orderId: order.orderId,
      },
    });
  }, []);

  const openDetails = useCallback((order) => {
    router.push({
      pathname: '/order-tracking',
      params: {
        orderId: order.orderId,
        mode: 'details',
      },
    });
  }, []);

  const renderOrderCard = ({ item }) => {
    const meta = getStatusMeta(item.status);
    const isPendingLike = ['pending', 'processing', 'paid'].includes(normalizeStatus(item.status));
    const isShipped = normalizeStatus(item.status) === 'shipped';
    const isDeletable = ['delivered', 'cancelled'].includes(normalizeStatus(item.status));

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderId}>{item.orderId}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>

          <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon} size={14} color={meta.color} />
            <Text style={[styles.statusPillText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Items</Text>
            <Text style={styles.infoValue}>{item.itemCount} item(s)</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>{item.payment}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Delivery</Text>
            <Text style={styles.infoValue}>{item?.delivery?.title || 'Standard Delivery'}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Amount</Text>
            <Text style={styles.amountValue}>{formatCurrency(item.total)}</Text>
          </View>
        </View>

        <View style={styles.itemPreviewWrap}>
          <Text style={styles.previewTitle}>Order Preview</Text>
          {(item.items || []).slice(0, 2).map((product) => (
            <Text key={`${item.orderId}-${product.id}`} style={styles.previewItem} numberOfLines={1}>
              {product.qty}x {product.name}
            </Text>
          ))}
          {(item.items || []).length > 2 && (
            <Text style={styles.moreItemsText}>+{item.items.length - 2} more item(s)</Text>
          )}
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.secondaryAction} onPress={() => openDetails(item)}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.sky} />
            <Text style={styles.secondaryActionText}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction} onPress={() => openTracking(item)}>
            <Ionicons name="locate-outline" size={16} color={COLORS.tomato} />
            <Text style={[styles.secondaryActionText, { color: COLORS.tomato }]}>Track</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction} onPress={() => shareOrder(item)}>
            <Ionicons name="share-social-outline" size={16} color={COLORS.textDark} />
            <Text style={[styles.secondaryActionText, { color: COLORS.textDark }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction} onPress={() => reorderItems(item)}>
            <Ionicons name="refresh-outline" size={16} color={COLORS.success} />
            <Text style={[styles.secondaryActionText, { color: COLORS.success }]}>Reorder</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomActionRow}>
          {isPendingLike && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelOrder(item)}>
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}

          {isShipped && (
            <TouchableOpacity style={styles.receivedBtn} onPress={() => markAsDelivered(item)}>
              <Text style={styles.receivedBtnText}>Mark as Received</Text>
            </TouchableOpacity>
          )}

          {isDeletable && (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteOrder(item.orderId)}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={42} color={COLORS.tomato} />
      </View>
      <Text style={styles.emptyTitle}>No orders found</Text>
      <Text style={styles.emptyText}>
        {search.trim()
          ? 'Try another search term or switch to a different status tab.'
          : 'Your orders will appear here after checkout.'}
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/')}>
        <Text style={styles.emptyBtnText}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (loadingOrders) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        <ActivityIndicator size="large" color={COLORS.tomato} />
        <Text style={styles.loaderText}>Loading orders...</Text>
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
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSub}>{orders.length} total order(s)</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/')}>
          <Ionicons name="storefront-outline" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{stats.delivered}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
        <TextInput
          placeholder="Search by order ID, item or payment"
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.tomato} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.orderId}
        renderItem={renderOrderCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <FlatList
            data={ORDER_TABS}
            horizontal
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            renderItem={({ item }) => {
              const active = selectedTab === item;
              return (
                <TouchableOpacity
                  style={[styles.tabChip, active && styles.activeTabChip]}
                  onPress={() => setSelectedTab(item)}
                >
                  <Text style={[styles.tabChipText, active && styles.activeTabChipText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        }
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.tomato} />
        }
      />
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

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
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

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.tomato,
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },

  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.textDark,
    fontSize: 14,
  },

  listContent: {
    paddingBottom: 30,
  },
  tabsRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
  },
  activeTabChip: {
    backgroundColor: COLORS.tomato,
    borderColor: COLORS.tomato,
  },
  tabChipText: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '800',
  },
  activeTabChipText: {
    color: COLORS.white,
  },

  orderCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  orderId: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '900',
  },
  orderDate: {
    marginTop: 4,
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

  orderBody: {
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  amountValue: {
    color: COLORS.tomato,
    fontSize: 15,
    fontWeight: '900',
  },

  itemPreviewWrap: {
    marginTop: 14,
    marginBottom: 14,
  },
  previewTitle: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  previewItem: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  moreItemsText: {
    marginTop: 4,
    color: COLORS.sky,
    fontSize: 12,
    fontWeight: '800',
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  secondaryAction: {
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryActionText: {
    color: COLORS.sky,
    fontSize: 13,
    fontWeight: '800',
  },

  bottomActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontWeight: '900',
    fontSize: 14,
  },
  receivedBtn: {
    flex: 1,
    backgroundColor: COLORS.successSoft,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  receivedBtnText: {
    color: COLORS.success,
    fontWeight: '900',
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: COLORS.tomatoSoft,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: COLORS.tomato,
    fontWeight: '900',
    fontSize: 14,
  },

  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 70,
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
});