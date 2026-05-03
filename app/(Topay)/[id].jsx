import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useUserOrdersQuery } from '../../Features/api/EcomerceSlice';
import { useUpdateOrderStatusMutation } from '../../Features/api/AdminSlice';
import { GetToken, GetUserDetails } from '../../Features/Funcslice';
import { uri } from '../../Features/api/Uri';

const LAST_ORDER_STORAGE_KEY = '@ysstore_last_order';
const ORDERS_STORAGE_KEY = '@ysstore_orders';

const tabs = [
  { key: 'toPay', label: 'To Pay', icon: 'card-outline' },
  { key: 'toShip', label: 'To Ship', icon: 'cube-outline' },
  { key: 'toReceive', label: 'To Receive', icon: 'bicycle-outline' },
  { key: 'refunds', label: 'Refunds', icon: 'refresh-outline' },
];

const COLORS = {
  tomato: '#ff6347',
  sky: '#0ea5e9',
  bg: '#f8fafc',
  white: '#ffffff',
  dark: '#111827',
  muted: '#64748b',
  border: '#e5e7eb',
  softTomato: '#fff1ee',
  softSky: '#eaf8ff',
  softGreen: '#ecfdf3',
  softPurple: '#f5edff',
  green: '#16a34a',
  purple: '#9333ea',
  danger: '#ef4444',
  dangerSoft: '#fee2e2',
};

const formatMoney = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

const formatDate = (dateString) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

const getOrderTabKey = (order) => {
  const status = normalizeStatus(order.status);
  const paymentStatus = normalizeStatus(order.paymentStatus);

  if (
    status.includes('refund') ||
    status.includes('return') ||
    status.includes('cancel')
  ) {
    return 'refunds';
  }

  if (
    paymentStatus === 'unpaid' ||
    paymentStatus === 'pending' ||
    status === 'pending' ||
    status === 'unpaid'
  ) {
    return 'toPay';
  }

  if (
    status === 'processing' ||
    status === 'paid' ||
    status === 'confirmed' ||
    status === 'preparing'
  ) {
    return 'toShip';
  }

  if (
    status === 'shipped' ||
    status === 'in transit' ||
    status === 'out for delivery'
  ) {
    return 'toReceive';
  }

  if (status === 'delivered') {
    return 'toReceive';
  }

  return 'toShip';
};

const getStatusInfo = (tabKey, order) => {
  const status = normalizeStatus(order?.status);

  if (tabKey === 'toPay') {
    return {
      label: 'Awaiting Payment',
      color: COLORS.tomato,
      bg: COLORS.softTomato,
    };
  }

  if (tabKey === 'toShip') {
    return {
      label: 'Preparing Shipment',
      color: COLORS.sky,
      bg: COLORS.softSky,
    };
  }

  if (tabKey === 'toReceive') {
    return {
      label: status === 'delivered' ? 'Delivered' : 'On The Way',
      color: COLORS.green,
      bg: COLORS.softGreen,
    };
  }

  if (tabKey === 'refunds') {
    return {
      label: status.includes('cancel') ? 'Cancelled' : 'Refund Request',
      color: COLORS.purple,
      bg: COLORS.softPurple,
    };
  }

  return {
    label: 'Order',
    color: COLORS.muted,
    bg: '#f1f5f9',
  };
};

const getImageUrl = (image) => {
  if (!image) return null;

  if (String(image).startsWith('http')) {
    return image;
  }

  return `${uri}/img/${image}`;
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

    const quantity = Number(product?.quantity || product?.qty || 1);

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

    const image =
      Array.isArray(product?.ProductImg) && product.ProductImg.length > 0
        ? product.ProductImg[0]
        : Array.isArray(productData?.ProductImg) &&
          productData.ProductImg.length > 0
        ? productData.ProductImg[0]
        : product?.image || null;

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
      image,
    };
  });

  const totalAmount = Number(order?.total || order?.totalAmount || 0);

  const normalizedOrder = {
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

  return {
    ...normalizedOrder,
    tabKey: getOrderTabKey(normalizedOrder),
  };
};

export default function OrderStatusScreen() {
  const { screenName } = useLocalSearchParams();

  const token = useSelector(GetToken);
  const userDetails = useSelector(GetUserDetails);
  const userId = userDetails?.id || userDetails?._id;

  const [activeTab, setActiveTab] = useState(screenName || 'toPay');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [localOrders, setLocalOrders] = useState([]);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useUserOrdersQuery(
    { token, id: userId },
    {
      skip: !token || !userId,
      pollingInterval: 10000,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const [updateOrderStatus, { isLoading: updating }] =
    useUpdateOrderStatusMutation();

  useEffect(() => {
    if (screenName) {
      setActiveTab(screenName);
    }
  }, [screenName]);

  useEffect(() => {
    const loadCachedOrders = async () => {
      try {
        const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        setLocalOrders(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        setLocalOrders([]);
      }
    };

    loadCachedOrders();
  }, []);

  const apiOrders = useMemo(() => {
    if (!data?.success || !Array.isArray(data?.data)) {
      return [];
    }

    return data.data.map(normalizeApiOrder);
  }, [data]);

  const orders = apiOrders.length > 0 ? apiOrders : localOrders;

  useEffect(() => {
    const persistApiOrders = async () => {
      try {
        if (apiOrders.length > 0) {
          await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(apiOrders));
          setLocalOrders(apiOrders);
        }
      } catch (error) {
        console.log('Failed to cache orders:', error);
      }
    };

    persistApiOrders();
  }, [apiOrders]);

  const tabCounts = useMemo(() => {
    return tabs.reduce((acc, tab) => {
      acc[tab.key] = orders.filter((order) => order.tabKey === tab.key).length;
      return acc;
    }, {});
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = orders.filter((item) => item.tabKey === activeTab);

    if (search.trim()) {
      const q = search.trim().toLowerCase();

      list = list.filter((item) => {
        const firstItem = item.items?.[0];

        return (
          String(item.orderId || '').toLowerCase().includes(q) ||
          String(item.trackingId || '').toLowerCase().includes(q) ||
          String(item.customer?.name || '').toLowerCase().includes(q) ||
          String(item.status || '').toLowerCase().includes(q) ||
          String(item.paymentStatus || '').toLowerCase().includes(q) ||
          String(firstItem?.name || '').toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [orders, activeTab, search]);

  const persistLastOrder = useCallback(async (order) => {
    await AsyncStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
  }, []);

  const persistUpdatedOrder = useCallback(
    async (updatedOrder) => {
      const nextOrders = orders.map((order) =>
        String(order.orderId) === String(updatedOrder.orderId)
          ? updatedOrder
          : order
      );

      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
      await AsyncStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(updatedOrder));
      setLocalOrders(nextOrders);
    },
    [orders]
  );

  const openTrackingPage = useCallback(
    async (order, mode = 'track') => {
      await persistLastOrder(order);

      router.push({
        pathname: '/(Order-tracking)/[orderId]',
        params: {
          orderId: order.orderId,
          mode,
        },
      });
    },
    [persistLastOrder]
  );

  const handleCancelOrder = useCallback(
    (order) => {
      Alert.alert(
        'Cancel order',
        `Are you sure you want to cancel order #${order.orderId}?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Cancel Order',
            style: 'destructive',
            onPress: async () => {
              try {
                if (order._id || order.rawId) {
                  await updateOrderStatus({
                    id: order._id || order.rawId,
                    status: 'Cancelled',
                    paymentStatus: order.paymentStatus || 'Paid',
                    token,
                  }).unwrap();
                }

                const updatedOrder = {
                  ...order,
                  status: 'Cancelled',
                  deliveryStatus: 'Cancelled',
                  tabKey: 'refunds',
                };

                await persistUpdatedOrder(updatedOrder);
                Alert.alert('Success', 'Order cancelled successfully.');
                refetch();
              } catch (error) {
                Alert.alert(
                  'Cancel failed',
                  error?.data?.message || 'Unable to cancel this order.'
                );
              }
            },
          },
        ]
      );
    },
    [updateOrderStatus, token, persistUpdatedOrder, refetch]
  );

  const handleConfirmReceived = useCallback(
    (order) => {
      Alert.alert(
        'Confirm received',
        `Confirm that you have received order #${order.orderId}?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              try {
                if (order._id || order.rawId) {
                  await updateOrderStatus({
                    id: order._id || order.rawId,
                    status: 'Delivered',
                    paymentStatus: 'Paid',
                    token,
                  }).unwrap();
                }

                const updatedOrder = {
                  ...order,
                  status: 'Delivered',
                  deliveryStatus: 'Delivered',
                  paymentStatus: 'Paid',
                  tabKey: 'toReceive',
                };

                await persistUpdatedOrder(updatedOrder);
                Alert.alert('Success', 'Order marked as received.');
                refetch();
              } catch (error) {
                Alert.alert(
                  'Update failed',
                  error?.data?.message || 'Unable to update this order.'
                );
              }
            },
          },
        ]
      );
    },
    [updateOrderStatus, token, persistUpdatedOrder, refetch]
  );

  const handlePayNow = useCallback(
    async (order) => {
      await persistLastOrder(order);

      router.push({
        pathname: '/Checkout',
        params: {
          orderId: order.orderId,
          amount: String(order.totalAmount || order.total || 0),
          mode: 'pay-order',
        },
      });
    },
    [persistLastOrder]
  );

  const handleMessageSeller = useCallback((order) => {
    const chatId = order?.storeChatId || '2';
    router.push(`../chart/storecharts/${chatId}`);
  }, []);

  const handleRefundDetails = useCallback(
    async (order) => {
      await openTrackingPage(order, 'details');
    },
    [openTrackingPage]
  );

  const handleContactSupport = useCallback((order) => {
    const chatId = order?.storeChatId || '2';
    router.push(`../chart/storecharts/${chatId}`);
  }, []);

  const handleShareOrder = useCallback(async (order) => {
    try {
      await Share.share({
        message:
          `YsStore Order\n` +
          `Order ID: ${order.orderId}\n` +
          `Tracking ID: ${order.trackingId || 'N/A'}\n` +
          `Amount: ${formatMoney(order.totalAmount)}\n` +
          `Status: ${order.status}\n` +
          `Payment: ${order.paymentStatus}`,
      });
    } catch (error) {
      Alert.alert('Share failed', 'Unable to share this order.');
    }
  }, []);

  const handleCallSeller = useCallback(async (order) => {
    const phone = order?.riderPhone || order?.customer?.phone;

    if (!phone) {
      Alert.alert('No phone number', 'Contact phone is not available for this order.');
      return;
    }

    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert('Call failed', 'Your device cannot start a phone call.');
      return;
    }

    Linking.openURL(url);
  }, []);

  const renderActionButtons = useCallback(
    (item) => {
      if (item.tabKey === 'toPay') {
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.outlineBtn}
              disabled={updating}
              onPress={() => handleCancelOrder(item)}
            >
              <Text style={styles.outlineText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => handlePayNow(item)}
            >
              <Text style={styles.primaryText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        );
      }

      if (item.tabKey === 'toShip') {
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => handleMessageSeller(item)}
            >
              <Text style={styles.outlineText}>Message Seller</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => openTrackingPage(item, 'details')}
            >
              <Text style={styles.primaryText}>View Details</Text>
            </TouchableOpacity>
          </View>
        );
      }

      if (item.tabKey === 'toReceive') {
        const delivered = normalizeStatus(item.status) === 'delivered';

        return (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => openTrackingPage(item, 'track')}
            >
              <Text style={styles.outlineText}>Track Order</Text>
            </TouchableOpacity>

            {!delivered ? (
              <TouchableOpacity
                style={styles.primaryBtn}
                disabled={updating}
                onPress={() => handleConfirmReceived(item)}
              >
                <Text style={styles.primaryText}>
                  {updating ? 'Updating...' : 'Confirm Received'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => openTrackingPage(item, 'details')}
              >
                <Text style={styles.primaryText}>Details</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      }

      return (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => handleRefundDetails(item)}
          >
            <Text style={styles.outlineText}>Refund Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => handleContactSupport(item)}
          >
            <Text style={styles.primaryText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [
      updating,
      handleCancelOrder,
      handlePayNow,
      handleMessageSeller,
      openTrackingPage,
      handleConfirmReceived,
      handleRefundDetails,
      handleContactSupport,
    ]
  );

  const renderOrder = useCallback(
    ({ item }) => {
      const firstItem = item.items?.[0];
      const status = getStatusInfo(item.tabKey, item);
      const imageUrl = getImageUrl(firstItem?.image);

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() => openTrackingPage(item, 'details')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.shopRow}>
              <Ionicons name="storefront-outline" size={17} color={COLORS.dark} />
              <Text style={styles.shopName} numberOfLines={1}>
                {firstItem?.brand || 'YsStore Seller'}
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: status.bg }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

          <View style={styles.productRow}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, styles.productImageFallback]}>
                <Ionicons name="image-outline" size={26} color={COLORS.muted} />
              </View>
            )}

            <View style={styles.productInfo}>
              <Text numberOfLines={2} style={styles.productName}>
                {firstItem?.name || 'Order item'}
              </Text>

              {item.items?.length > 1 && (
                <Text style={styles.moreItems}>
                  +{item.items.length - 1} more item(s)
                </Text>
              )}

              <Text style={styles.orderId}>Order ID: {item.orderId}</Text>
              <Text style={styles.date}>Date: {formatDate(item.createdAt)}</Text>

              {item.tabKey === 'refunds' && (
                <Text style={styles.refundText}>
                  Refund: {normalizeStatus(item.status).includes('cancel') ? 'Cancelled' : 'Processing'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.qty}>
              Qty: {item.items?.reduce((sum, x) => sum + Number(x.quantity || 1), 0) || 0}
            </Text>

            <Text style={styles.total}>
              Total: {formatMoney(item.totalAmount || item.total)}
            </Text>
          </View>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => handleShareOrder(item)}
            >
              <Ionicons name="share-social-outline" size={15} color={COLORS.muted} />
              <Text style={styles.quickActionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => handleCallSeller(item)}
            >
              <Ionicons name="call-outline" size={15} color={COLORS.muted} />
              <Text style={styles.quickActionText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => openTrackingPage(item, 'track')}
            >
              <Ionicons name="navigate-outline" size={15} color={COLORS.muted} />
              <Text style={styles.quickActionText}>Track</Text>
            </TouchableOpacity>
          </View>

          {renderActionButtons(item)}
        </TouchableOpacity>
      );
    },
    [
      openTrackingPage,
      renderActionButtons,
      handleShareOrder,
      handleCallSeller,
    ]
  );

  const EmptyState = () => {
    const current = tabs.find((tab) => tab.key === activeTab);

    return (
      <View style={styles.emptyBox}>
        <View style={styles.emptyIcon}>
          <Ionicons name={current?.icon || 'receipt-outline'} size={38} color={COLORS.tomato} />
        </View>

        <Text style={styles.emptyTitle}>No orders found</Text>

        <Text style={styles.emptyText}>
          {search.trim()
            ? 'Try another search keyword.'
            : `You do not have any ${current?.label.toLowerCase()} orders right now.`}
        </Text>

        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/')}>
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && localOrders.length === 0) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.tomato} />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </SafeAreaView>
    );
  }

  if (!token || !userId) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <View style={styles.emptyIcon}>
          <Ionicons name="lock-closed-outline" size={38} color={COLORS.tomato} />
        </View>

        <Text style={styles.emptyTitle}>Login required</Text>

        <Text style={styles.emptyText}>
          Please login to view your real order center.
        </Text>

        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/Login')}>
          <Text style={styles.shopBtnText}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>
            Manage your purchases easily {isFetching ? '• Syncing...' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => setShowSearch((prev) => !prev)}
        >
          <Feather name={showSearch ? 'x' : 'search'} size={22} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color={COLORS.muted} />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search order, tracking ID, product..."
            placeholderTextColor={COLORS.muted}
            style={styles.searchInput}
          />

          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={19} color={COLORS.tomato} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <View style={styles.summaryIcon}>
            <MaterialIcons name="shopping-bag" size={28} color="#fff" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Order Center</Text>
            <Text style={styles.summaryText}>
              Track payment, shipping and refunds
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshMiniBtn} onPress={refetch}>
          <Ionicons name="refresh" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tab, active && styles.activeTab]}
              >
                <Ionicons
                  name={tab.icon}
                  size={19}
                  color={active ? '#fff' : COLORS.muted}
                />

                <Text style={[styles.tabText, active && styles.activeTabText]}>
                  {tab.label}
                </Text>

                <View style={[styles.countPill, active && styles.activeCountPill]}>
                  <Text style={[styles.countText, active && styles.activeCountText]}>
                    {tabCounts[tab.key] || 0}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item, index) => String(item.orderId || item.rawId || index)}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={COLORS.tomato}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  loadingWrap: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
    fontWeight: '800',
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 25,
    fontWeight: '900',
    color: COLORS.dark,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: COLORS.muted,
  },

  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  searchBox: {
    marginHorizontal: 18,
    marginBottom: 12,
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  searchInput: {
    flex: 1,
    color: COLORS.dark,
    fontSize: 14,
    fontWeight: '700',
  },

  summaryCard: {
    marginHorizontal: 18,
    marginBottom: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: COLORS.sky,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.tomato,
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#fff',
  },

  summaryText: {
    marginTop: 3,
    fontSize: 13,
    color: '#e0f2fe',
  },

  refreshMiniBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabsWrapper: {
    marginBottom: 8,
  },

  tabsContainer: {
    paddingHorizontal: 18,
    gap: 10,
  },

  tab: {
    height: 43,
    paddingHorizontal: 15,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    elevation: 1,
  },

  activeTab: {
    backgroundColor: COLORS.tomato,
  },

  tabText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.muted,
  },

  activeTabText: {
    color: '#fff',
  },

  countPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },

  activeCountPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  countText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.muted,
  },

  activeCountText: {
    color: '#fff',
  },

  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 14,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },

  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },

  shopName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.dark,
    flex: 1,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '900',
  },

  productRow: {
    flexDirection: 'row',
    gap: 12,
  },

  productImage: {
    width: 86,
    height: 86,
    borderRadius: 18,
    backgroundColor: COLORS.border,
  },

  productImageFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.dark,
    lineHeight: 21,
  },

  moreItems: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.sky,
    fontWeight: '800',
  },

  orderId: {
    marginTop: 7,
    fontSize: 12,
    color: COLORS.muted,
  },

  date: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.muted,
  },

  refundText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.purple,
  },

  totalRow: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  qty: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
  },

  total: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.dark,
  },

  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  quickActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.muted,
  },

  actionRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },

  outlineBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.sky,
  },

  outlineText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.sky,
  },

  primaryBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.tomato,
  },

  primaryText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
  },

  emptyBox: {
    marginTop: 70,
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: COLORS.softTomato,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.dark,
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },

  shopBtn: {
    marginTop: 18,
    backgroundColor: COLORS.sky,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },

  shopBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
});