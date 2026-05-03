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
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
  ScrollView,
  Share,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';

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

const ORDER_TABS = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

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

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);

  return (
    <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
      <Ionicons name={meta.icon} size={14} color={meta.color} />
      <Text style={[styles.statusPillText, { color: meta.color }]}>
        {meta.label}
      </Text>
    </View>
  );
}

function OrderDetailsModal({
  visible,
  onClose,
  order,
  onUpdateStatus,
  updating,
  onTrack,
  onShare,
  onCallRider,
  onChatSupport,
}) {
  if (!order) return null;

  const canCancel = !['cancelled', 'delivered'].includes(normalizeStatus(order.status));
  const canMarkDelivered = normalizeStatus(order.status) === 'shipped';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <Text style={styles.modalSub}>#{order.orderId}</Text>
            </View>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHero}>
              <View>
                <Text style={styles.modalHeroLabel}>Total Amount</Text>
                <Text style={styles.modalHeroAmount}>
                  {formatCurrency(order.totalAmount)}
                </Text>
              </View>

              <StatusBadge status={order.status} />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Order Info</Text>

              <View style={styles.modalInfoLine}>
                <Text style={styles.modalInfoLabel}>Placed</Text>
                <Text style={styles.modalInfoValue}>{formatDate(order.createdAt)}</Text>
              </View>

              <View style={styles.modalInfoLine}>
                <Text style={styles.modalInfoLabel}>Payment</Text>
                <Text style={styles.modalInfoValue}>{order.paymentStatus || 'N/A'}</Text>
              </View>

              <View style={styles.modalInfoLine}>
                <Text style={styles.modalInfoLabel}>Tracking ID</Text>
                <Text style={styles.modalInfoValue}>{order.trackingId || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Customer</Text>
              <Text style={styles.customerName}>{order.customer?.name || 'Guest'}</Text>
              <Text style={styles.customerText}>{order.customer?.email || 'N/A'}</Text>
              <Text style={styles.customerText}>{order.customer?.phone || 'N/A'}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Shipping Address</Text>
              <Text style={styles.customerText}>{order.deliveryAddress || 'N/A'}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Items Ordered</Text>

              {(order.items || []).map((item, index) => (
                <View key={`${order.orderId}-${index}`} style={styles.modalItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.modalItemSub}>
                      Qty: {item.quantity || item.qty || 1}
                      {item.sku ? `  •  SKU: ${item.sku}` : ''}
                    </Text>

                    {!!item.variant && (
                      <Text style={styles.modalItemSub}>Variant: {item.variant}</Text>
                    )}
                  </View>

                  <Text style={styles.modalItemPrice}>
                    {formatCurrency(
                      Number(item.price || 0) * Number(item.quantity || item.qty || 1)
                    )}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Payment Summary</Text>

              <View style={styles.modalInfoLine}>
                <Text style={styles.modalInfoLabel}>Shipping</Text>
                <Text style={styles.modalInfoValue}>
                  {formatCurrency(order.shippingCost)}
                </Text>
              </View>

              <View style={styles.modalInfoLine}>
                <Text style={styles.modalInfoLabel}>Tax</Text>
                <Text style={styles.modalInfoValue}>{formatCurrency(order.tax)}</Text>
              </View>

              <View style={styles.modalDivider} />

              <View style={styles.modalInfoLine}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalOutlineBtn} onPress={() => onTrack(order, 'track')}>
              <Ionicons name="locate-outline" size={17} color={COLORS.tomato} />
              <Text style={styles.modalOutlineBtnText}>Track</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOutlineBtn} onPress={() => onShare(order)}>
              <Ionicons name="share-social-outline" size={17} color={COLORS.sky} />
              <Text style={[styles.modalOutlineBtnText, { color: COLORS.sky }]}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOutlineBtn} onPress={() => onCallRider(order)}>
              <Ionicons name="call-outline" size={17} color={COLORS.success} />
              <Text style={[styles.modalOutlineBtnText, { color: COLORS.success }]}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOutlineBtn} onPress={() => onChatSupport(order)}>
              <Ionicons name="chatbubble-outline" size={17} color={COLORS.textDark} />
              <Text style={[styles.modalOutlineBtnText, { color: COLORS.textDark }]}>Chat</Text>
            </TouchableOpacity>

            {canMarkDelivered && (
              <TouchableOpacity
                style={styles.modalSuccessBtn}
                disabled={updating}
                onPress={() => onUpdateStatus(order, 'Delivered')}
              >
                <Text style={styles.modalSuccessBtnText}>
                  {updating ? 'Updating...' : 'Mark Delivered'}
                </Text>
              </TouchableOpacity>
            )}

            {canCancel && (
              <TouchableOpacity
                style={styles.modalDangerBtn}
                disabled={updating}
                onPress={() => onUpdateStatus(order, 'Cancelled')}
              >
                <Text style={styles.modalDangerBtnText}>
                  {updating ? 'Updating...' : 'Cancel Order'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function OrdersPage() {
  const token = useSelector(GetToken);
  const userDetails = useSelector(GetUserDetails);
  const userId = userDetails?.id || userDetails?._id;

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

  const [updateOrderStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  
  useEffect(()=>{
    console.log(data)
  },[data])

  const [selectedTab, setSelectedTab] = useState('All');
  const [search, setSearch] = useState('');
  const [modalOrder, setModalOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [localOrders, setLocalOrders] = useState([]);

  const apiOrders = useMemo(() => {
    if (!data?.success || !Array.isArray(data?.data)) {
      return [];
    }

    return data.data.map(normalizeApiOrder);
  }, [data]);

  const orders = data?.data?.length > 0 ? data?.data : [];

  useEffect(() => {
    if(!data?.data)return;
        setLocalOrders(data?.data);

  }, [data]);

  // useEffect(() => {
  //   const persistApiOrders = async () => {
  //     try {
  //       if (apiOrders.length > 0) {
  //         // await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(apiOrders));
  //         // setLocalOrders(apiOrders);
  //       }
  //     } catch (error) {
  //       console.log('Failed to persist API orders:', error);
  //     }
  //   };

  //   persistApiOrders();
  // }, [apiOrders]);

  const persistOrders = useCallback(async (nextOrders) => {
    setLocalOrders(nextOrders);
    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
  }, []);

  const persistLastOrder = useCallback(async (order) => {
    await AsyncStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
  }, []);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      active: orders.filter((order) => {
        const s = normalizeStatus(order.status);
        return s === 'processing' || s === 'shipped' || s === 'paid';
      }).length,
      delivered: orders.filter((order) => normalizeStatus(order.status) === 'delivered').length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (selectedTab !== 'All') {
      list = list.filter(
        (item) => normalizeStatus(item.status) === normalizeStatus(selectedTab)
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();

      list = list.filter((item) => {
        const orderId = String(item.orderId || '').toLowerCase();
        const trackingId = String(item.trackingId || '').toLowerCase();
        const payment = String(item.paymentStatus || '').toLowerCase();
        const status = String(item.status || '').toLowerCase();
        const customer = String(item.customer?.name || '').toLowerCase();
        const itemNames = Array.isArray(item.items)
          ? item.items.map((x) => x.name).join(' ').toLowerCase()
          : '';

        return (
          orderId.includes(q) ||
          trackingId.includes(q) ||
          payment.includes(q) ||
          status.includes(q) ||
          customer.includes(q) ||
          itemNames.includes(q)
        );
      });
    }

    return list;
  }, [orders, search, selectedTab]);

  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      Alert.alert('Refresh failed', 'Unable to refresh orders right now.');
    }
  }, [refetch]);

  const handleOpenModal = useCallback(
    async (order) => {
      await persistLastOrder(order);
      setModalOrder(order);
      setModalVisible(true);
    },
    [persistLastOrder]
  );

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);

    setTimeout(() => {
      setModalOrder(null);
    }, 200);
  }, []);

  const openTrackingPage = useCallback(
    async (order, mode = 'track') => {
      await persistLastOrder(order);
      handleCloseModal();

      router.push({
        pathname: '/(Order-tracking)/[orderId]',
        params: {
          orderId: order.orderId,
          mode,
        },
      });
    },
    [persistLastOrder, handleCloseModal]
  );

  const handleShareOrder = useCallback(async (order) => {
    try {
      await Share.share({
        message:
          `YsStore Order\n` +
          `Order ID: ${order.orderId}\n` +
          `Tracking ID: ${order.trackingId || 'N/A'}\n` +
          `Amount: ${formatCurrency(order.totalAmount)}\n` +
          `Status: ${order.status}\n` +
          `Payment: ${order.paymentStatus}`,
      });
    } catch (error) {
      Alert.alert('Share failed', 'Unable to share this order.');
    }
  }, []);

  const handleCallRider = useCallback(async (order) => {
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
  }, []);

  const handleChatSupport = useCallback((order) => {
    const chatId = order?.storeChatId || '2';
    router.push(`../chart/storecharts/${chatId}`);
  }, []);

  const updateLocalOrderStatus = useCallback(
    async (order, newStatus) => {
      const updatedOrder = {
        ...order,
        status: newStatus,
        deliveryStatus: newStatus,
        paymentStatus: newStatus === 'Delivered' ? 'Paid' : order.paymentStatus,
      };

      const nextOrders = orders.map((item) =>
        String(item.orderId) === String(order.orderId) ? updatedOrder : item
      );

      await persistOrders(nextOrders);
      await persistLastOrder(updatedOrder);

      setModalOrder((prev) =>
        prev && String(prev.orderId) === String(order.orderId) ? updatedOrder : prev
      );

      return updatedOrder;
    },
    [orders, persistOrders, persistLastOrder]
  );

  const handleUpdateStatus = useCallback(
    async (order, newStatus) => {
      if (!order) return;
      console.log(order)
      const title = newStatus === 'Cancelled' ? 'Cancel order' : 'Update order';

      const message =
        newStatus === 'Cancelled'
          ? `Are you sure you want to cancel order #${order.orderId}?`
          : `Mark order #${order.orderId} as ${newStatus}?`;

      Alert.alert(title, message, [
        { text: 'No', style: 'cancel' },
        {
          text: newStatus === 'Cancelled' ? 'Cancel Order' : 'Yes, Update',
          style: newStatus === 'Cancelled' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              console.log({
                  id: order._id || order.rawId,
                  status: newStatus,
                  paymentStatus:
                    newStatus === 'Delivered' ? 'Paid' : order.paymentStatus || 'Paid',
                  token,})
              if (order._id || order.rawId) {
                await updateOrderStatus({
                  id: order._id || order.rawId,
                  status: newStatus,
                  paymentStatus:
                    newStatus === 'Delivered' ? 'Paid' : order.paymentStatus || 'Paid',
                  token,
                }).unwrap();
              }

              await updateLocalOrderStatus(order, newStatus);

              Alert.alert('Success', `Order updated to ${newStatus}.`);
              refetch();
            } catch (error) {
              Alert.alert(
                'Update failed',
                error?.data?.message || 'Failed to update order status.'
              );
            }
          },
        },
      ]);
    },
    [updateOrderStatus, updateLocalOrderStatus, token, refetch]
  );

  const renderOrderCard = useCallback(
    ({ item }) => {
      const isPendingLike = ['processing', 'paid'].includes(normalizeStatus(item?.status));
      const isShipped = normalizeStatus(item?.status) === 'shipped';
      const firstItem = item?.items?.[0];

      return (
        <View style={styles.orderCard}>
          <View style={styles.orderTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderId}>#{item.orderId}</Text>
              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            </View>

            <StatusBadge status={item.status} />
          </View>

          <View style={styles.orderBody}>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Items</Text>
              <Text style={styles.infoValue}>{item.items?.length || 0} item(s)</Text>
            </View>

            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Payment</Text>
              <Text style={styles.infoValue}>{item.paymentStatus}</Text>
            </View>

            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Tracking</Text>
              <Text style={styles.infoValue}>{item.trackingId}</Text>
            </View>

            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.amountValue}>{formatCurrency(item.totalAmount)}</Text>
            </View>
          </View>

          <View style={styles.itemPreviewWrap}>
            <Text style={styles.previewTitle}>Order Preview</Text>

            {firstItem ? (
              <>
                {(item.items || []).slice(0, 2).map((product, index) => (
                  <Text
                    key={`${item.orderId}-${index}`}
                    style={styles.previewItem}
                    numberOfLines={1}
                  >
                    {product.quantity}x {product.name}
                  </Text>
                ))}

                {(item.items || []).length > 2 && (
                  <Text style={styles.moreItemsText}>
                    +{item.items.length - 2} more item(s)
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.previewItem}>No item information.</Text>
            )}
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.secondaryAction} onPress={() => handleOpenModal(item)}>
              <Ionicons name="document-text-outline" size={16} color={COLORS.sky} />
              <Text style={styles.secondaryActionText}>Modal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryAction} onPress={() => openTrackingPage(item, 'details')}>
              <Ionicons name="reader-outline" size={16} color={COLORS.success} />
              <Text style={[styles.secondaryActionText, { color: COLORS.success }]}>
                Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryAction} onPress={() => openTrackingPage(item, 'track')}>
              <Ionicons name="locate-outline" size={16} color={COLORS.tomato} />
              <Text style={[styles.secondaryActionText, { color: COLORS.tomato }]}>
                Track
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryAction} onPress={() => handleShareOrder(item)}>
              <Ionicons name="share-social-outline" size={16} color={COLORS.textDark} />
              <Text style={[styles.secondaryActionText, { color: COLORS.textDark }]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomActionRow}>
            {isPendingLike&&!isShipped && (
              <TouchableOpacity
                style={styles.cancelBtn}
                disabled={updating}
                onPress={() => handleUpdateStatus(item, 'Cancelled')}
              >
                <Text style={styles.cancelBtnText}>Cancel Order</Text>
              </TouchableOpacity>
            )}
            {isPendingLike&&!isShipped && (
              <TouchableOpacity
                style={styles.receivedBtn}
                disabled={updating}
                onPress={() => handleUpdateStatus(item, 'Delivered')}
              >
                <Text style={styles.receivedBtnText}>
                  {updating ? 'Updating...' : 'Mark as Received'}
                </Text>
              </TouchableOpacity>
            )}

            {isShipped &&!isPendingLike&& (
              <TouchableOpacity
                style={styles.receivedBtn}
                disabled={updating}
                onPress={() => handleUpdateStatus(item, 'Delivered')}
              >
                <Text style={styles.receivedBtnText}>
                  {updating ? 'Updating...' : 'Mark as Received'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    },
    [
      handleOpenModal,
      openTrackingPage,
      handleShareOrder,
      handleUpdateStatus,
      updating,
    ]
  );

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

  if (isLoading && localOrders.length === 0) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        <ActivityIndicator size="large" color={COLORS.tomato} />
        <Text style={styles.loaderText}>Loading orders...</Text>
      </SafeAreaView>
    );
  }

  if (!token || !userId) {
    return (
      <SafeAreaView style={styles.emptyScreenWrap}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

        <View style={styles.emptyIconWrap}>
          <Ionicons name="lock-closed-outline" size={42} color={COLORS.tomato} />
        </View>

        <Text style={styles.emptyTitle}>Login required</Text>
        <Text style={styles.emptyText}>Please login to view your order history.</Text>

        <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/Login')}>
          <Text style={styles.emptyBtnText}>Go to Login</Text>
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
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSub}>
            {orders.length} total order(s)
            {isFetching ? ' • Syncing...' : ''}
          </Text>
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
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {stats.delivered}
          </Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />

        <TextInput
          placeholder="Search order ID, tracking ID, item or status"
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
        keyExtractor={(item, index) => String(item.orderId || item.rawId || index)}
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
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={handleRefresh}
            tintColor={COLORS.tomato}
          />
        }
      />

      <OrderDetailsModal
        visible={modalVisible}
        onClose={handleCloseModal}
        order={modalOrder}
        onUpdateStatus={handleUpdateStatus}
        updating={updating}
        onTrack={openTrackingPage}
        onShare={handleShareOrder}
        onCallRider={handleCallRider}
        onChatSupport={handleChatSupport}
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
  emptyScreenWrap: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
    paddingBottom: 34,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bg,
    maxHeight: '92%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: '900',
  },
  modalSub: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHero: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalHeroLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  modalHeroAmount: {
    marginTop: 4,
    color: COLORS.tomato,
    fontSize: 22,
    fontWeight: '900',
  },
  modalSection: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  modalSectionTitle: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
  },
  modalInfoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 12,
  },
  modalInfoLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  modalInfoValue: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '800',
    flexShrink: 1,
    textAlign: 'right',
  },
  customerName: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 6,
  },
  customerText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '600',
  },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemName: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '900',
  },
  modalItemSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  modalItemPrice: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '900',
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalLabel: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '900',
  },
  totalValue: {
    color: COLORS.tomato,
    fontSize: 18,
    fontWeight: '900',
  },
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 4,
  },
  modalOutlineBtn: {
    flex: 1,
    minWidth: '45%',
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modalOutlineBtnText: {
    color: COLORS.tomato,
    fontSize: 14,
    fontWeight: '900',
  },
  modalSuccessBtn: {
    flex: 1,
    minWidth: '45%',
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSuccessBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },
  modalDangerBtn: {
    flex: 1,
    minWidth: '45%',
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.dangerSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDangerBtnText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '900',
  },
});