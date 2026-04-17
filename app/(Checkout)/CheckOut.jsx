import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

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
  dark: '#111827',
};

const FALLBACK_CART = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headset',
    brand: 'YsStore HQ',
    price: 18500,
    qty: 1,
  },
  {
    id: '2',
    name: 'Smart Wrist Watch Pro',
    brand: 'Fashion Hub',
    price: 32000,
    qty: 2,
  },
];

const INITIAL_ADDRESSES = [
  {
    id: 'addr1',
    label: 'Home',
    fullName: 'Suleiman Yusuf',
    phone: '+234 800 000 0000',
    addressLine: 'No 2 Kankara Road, Katsina State, Nigeria',
    isDefault: true,
  },
  {
    id: 'addr2',
    label: 'Office',
    fullName: 'Suleiman Yusuf',
    phone: '+234 811 111 1111',
    addressLine: 'Custom Market Road, Abuja, Nigeria',
    isDefault: false,
  },
];

const DELIVERY_METHODS = [
  {
    id: 'standard',
    title: 'Standard Delivery',
    subtitle: '2 - 3 days',
    fee: 3500,
    icon: 'cube-outline',
  },
  {
    id: 'express',
    title: 'Express Delivery',
    subtitle: 'Same day / next day',
    fee: 7000,
    icon: 'flash-outline',
  },
  {
    id: 'pickup',
    title: 'Store Pickup',
    subtitle: 'Pick up from store branch',
    fee: 0,
    icon: 'storefront-outline',
  },
];

const PAYMENT_METHODS = [
  {
    id: 'paystack',
    title: 'Paystack',
    subtitle: 'Card / Bank / Transfer',
    icon: 'card-outline',
  },
  {
    id: 'wallet',
    title: 'Wallet',
    subtitle: 'Pay from your YS wallet',
    icon: 'wallet-outline',
  },
  {
    id: 'cash',
    title: 'Cash on Delivery',
    subtitle: 'Pay when order arrives',
    icon: 'cash-outline',
  },
];

const formatCurrency = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

export default function CheckoutScreen() {
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState('addr1');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState('standard');
  const [selectedPaymentId, setSelectedPaymentId] = useState('paystack');

  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderNote, setOrderNote] = useState('');

  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    fullName: '',
    phone: '',
    addressLine: '',
  });

  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setCartItems(Array.isArray(parsed) ? parsed : FALLBACK_CART);
        } else {
          setCartItems(FALLBACK_CART);
        }
      } catch (error) {
        setCartItems(FALLBACK_CART);
      } finally {
        setLoadingCart(false);
      }
    };

    loadCart();
  }, []);

  const selectedAddress = useMemo(() => {
    return addresses.find((item) => item.id === selectedAddressId) || null;
  }, [addresses, selectedAddressId]);

  const selectedDelivery = useMemo(() => {
    return DELIVERY_METHODS.find((item) => item.id === selectedDeliveryId);
  }, [selectedDeliveryId]);

  const selectedPayment = useMemo(() => {
    return PAYMENT_METHODS.find((item) => item.id === selectedPaymentId);
  }, [selectedPaymentId]);

  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.qty || 1), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
      0
    );
  }, [cartItems]);

  const vat = useMemo(() => subtotal * 0.04, [subtotal]);

  const deliveryFee = useMemo(() => {
    return selectedDelivery?.fee || 0;
  }, [selectedDelivery]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.value) / 100;
    }

    if (appliedCoupon.type === 'fixed') {
      return appliedCoupon.value;
    }

    return 0;
  }, [appliedCoupon, subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal + vat + deliveryFee - discountAmount);
  }, [subtotal, vat, deliveryFee, discountAmount]);

  const applyCoupon = useCallback(() => {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      Alert.alert('Coupon required', 'Please enter a coupon code.');
      return;
    }

    if (code === 'YS10') {
      setAppliedCoupon({
        code,
        type: 'percentage',
        value: 10,
      });
      Alert.alert('Coupon applied', '10% discount has been applied.');
      return;
    }

    if (code === 'SAVE5000') {
      setAppliedCoupon({
        code,
        type: 'fixed',
        value: 5000,
      });
      Alert.alert('Coupon applied', '₦5,000 discount has been applied.');
      return;
    }

    if (code === 'FREESHIP') {
      setAppliedCoupon({
        code,
        type: 'fixed',
        value: deliveryFee,
      });
      Alert.alert('Coupon applied', 'Delivery discount has been applied.');
      return;
    }

    Alert.alert('Invalid coupon', 'This coupon code is not valid.');
  }, [coupon, deliveryFee]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCoupon('');
  }, []);

  const handleAddAddress = useCallback(() => {
    if (
      !newAddress.label.trim() ||
      !newAddress.fullName.trim() ||
      !newAddress.phone.trim() ||
      !newAddress.addressLine.trim()
    ) {
      Alert.alert('Incomplete address', 'Please fill all address fields.');
      return;
    }

    const addressObj = {
      id: `addr_${Date.now()}`,
      label: newAddress.label.trim(),
      fullName: newAddress.fullName.trim(),
      phone: newAddress.phone.trim(),
      addressLine: newAddress.addressLine.trim(),
      isDefault: false,
    };

    setAddresses((prev) => [addressObj, ...prev]);
    setSelectedAddressId(addressObj.id);
    setNewAddress({
      label: '',
      fullName: '',
      phone: '',
      addressLine: '',
    });
    setShowAddAddressForm(false);

    Alert.alert('Address added', 'Your new address has been added.');
  }, [newAddress]);

  const validateCheckout = useCallback(() => {
    if (!cartItems.length) {
      Alert.alert('Cart is empty', 'Add items to cart before checkout.');
      return false;
    }

    if (!selectedAddress) {
      Alert.alert('Address required', 'Please select a delivery address.');
      return false;
    }

    if (!selectedDelivery) {
      Alert.alert('Delivery method required', 'Please choose a delivery method.');
      return false;
    }

    if (!selectedPayment) {
      Alert.alert('Payment method required', 'Please choose a payment method.');
      return false;
    }

    return true;
  }, [cartItems.length, selectedAddress, selectedDelivery, selectedPayment]);

  const handlePlaceOrder = useCallback(async () => {
    if (!validateCheckout()) return;

    setPlacingOrder(true);

    try {
      const orderPayload = {
        orderId: `YS-${Date.now()}`,
        items: cartItems,
        itemCount,
        address: selectedAddress,
        delivery: selectedDelivery,
        payment: selectedPayment,
        coupon: appliedCoupon,
        orderNote,
        subtotal,
        vat,
        deliveryFee,
        discountAmount,
        total,
        createdAt: new Date().toISOString(),
        status: selectedPaymentId === 'cash' ? 'Pending Confirmation' : 'Paid',
      };

      await AsyncStorage.setItem('@ysstore_last_order', JSON.stringify(orderPayload));

      if (selectedPaymentId !== 'cash') {
        await AsyncStorage.removeItem(CART_STORAGE_KEY).catch(() => {});
      }

      router.push({
        pathname: '/order-success',
        params: {
          orderId: orderPayload.orderId,
          total: String(orderPayload.total),
          payment: selectedPayment.title,
        },
      });
    } catch (error) {
      Alert.alert('Order failed', error?.message || 'Unable to place order.');
    } finally {
      setPlacingOrder(false);
    }
  }, [
    validateCheckout,
    cartItems,
    itemCount,
    selectedAddress,
    selectedDelivery,
    selectedPayment,
    appliedCoupon,
    orderNote,
    subtotal,
    vat,
    deliveryFee,
    discountAmount,
    total,
    selectedPaymentId,
  ]);

  if (loadingCart) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORS.tomato} />
        <Text style={styles.loaderText}>Loading checkout...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.headerSub}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeadRow}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => setShowAddAddressForm((prev) => !prev)}>
              <Text style={styles.linkText}>
                {showAddAddressForm ? 'Close' : 'Add New'}
              </Text>
            </TouchableOpacity>
          </View>

          {addresses.map((address) => {
            const active = selectedAddressId === address.id;

            return (
              <TouchableOpacity
                key={address.id}
                style={[styles.optionCard, active && styles.optionCardActive]}
                onPress={() => setSelectedAddressId(address.id)}
                activeOpacity={0.88}
              >
                <View style={styles.optionTopRow}>
                  <View style={styles.labelPill}>
                    <Text style={styles.labelPillText}>{address.label}</Text>
                  </View>

                  {active && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.tomato} />
                  )}
                </View>

                <Text style={styles.addressName}>{address.fullName}</Text>
                <Text style={styles.addressText}>{address.addressLine}</Text>
                <Text style={styles.addressPhone}>{address.phone}</Text>
              </TouchableOpacity>
            );
          })}

          {showAddAddressForm && (
            <View style={styles.addAddressBox}>
              <TextInput
                placeholder="Label (Home, Office...)"
                placeholderTextColor={COLORS.textMuted}
                value={newAddress.label}
                onChangeText={(text) =>
                  setNewAddress((prev) => ({ ...prev, label: text }))
                }
                style={styles.input}
              />
              <TextInput
                placeholder="Full name"
                placeholderTextColor={COLORS.textMuted}
                value={newAddress.fullName}
                onChangeText={(text) =>
                  setNewAddress((prev) => ({ ...prev, fullName: text }))
                }
                style={styles.input}
              />
              <TextInput
                placeholder="Phone number"
                placeholderTextColor={COLORS.textMuted}
                value={newAddress.phone}
                onChangeText={(text) =>
                  setNewAddress((prev) => ({ ...prev, phone: text }))
                }
                style={styles.input}
              />
              <TextInput
                placeholder="Full address"
                placeholderTextColor={COLORS.textMuted}
                value={newAddress.addressLine}
                onChangeText={(text) =>
                  setNewAddress((prev) => ({ ...prev, addressLine: text }))
                }
                style={[styles.input, styles.textArea]}
                multiline
              />

              <TouchableOpacity style={styles.primaryMiniBtn} onPress={handleAddAddress}>
                <Text style={styles.primaryMiniBtnText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Method</Text>

          {DELIVERY_METHODS.map((method) => {
            const active = selectedDeliveryId === method.id;

            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodCard, active && styles.optionCardActive]}
                onPress={() => setSelectedDeliveryId(method.id)}
                activeOpacity={0.88}
              >
                <View style={styles.methodLeft}>
                  <View style={styles.methodIconWrap}>
                    <Ionicons name={method.icon} size={18} color={COLORS.sky} />
                  </View>

                  <View>
                    <Text style={styles.methodTitle}>{method.title}</Text>
                    <Text style={styles.methodSub}>{method.subtitle}</Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.methodFee}>{formatCurrency(method.fee)}</Text>
                  {active && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={COLORS.tomato}
                      style={{ marginTop: 6 }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {PAYMENT_METHODS.map((method) => {
            const active = selectedPaymentId === method.id;

            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodCard, active && styles.optionCardActive]}
                onPress={() => setSelectedPaymentId(method.id)}
                activeOpacity={0.88}
              >
                <View style={styles.methodLeft}>
                  <View style={styles.methodIconWrap}>
                    <Ionicons name={method.icon} size={18} color={COLORS.tomato} />
                  </View>

                  <View>
                    <Text style={styles.methodTitle}>{method.title}</Text>
                    <Text style={styles.methodSub}>{method.subtitle}</Text>
                  </View>
                </View>

                {active && (
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.tomato} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Coupon</Text>

          <View style={styles.couponRow}>
            <TextInput
              placeholder="Enter coupon code"
              placeholderTextColor={COLORS.textMuted}
              value={coupon}
              onChangeText={setCoupon}
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              autoCapitalize="characters"
            />

            {appliedCoupon ? (
              <TouchableOpacity style={styles.removeCouponBtn} onPress={removeCoupon}>
                <Ionicons name="close" size={18} color={COLORS.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.applyBtn} onPress={applyCoupon}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            )}
          </View>

          {appliedCoupon && (
            <View style={styles.appliedCouponBox}>
              <MaterialCommunityIcons
                name="ticket-percent-outline"
                size={18}
                color={COLORS.success}
              />
              <Text style={styles.appliedCouponText}>
                {appliedCoupon.code} applied successfully
              </Text>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Order Note</Text>
          <TextInput
            placeholder="Add any note for delivery or order handling..."
            placeholderTextColor={COLORS.textMuted}
            value={orderNote}
            onChangeText={setOrderNote}
            style={[styles.input, styles.textArea]}
            multiline
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Items Preview</Text>

          {cartItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemBrand}>{item.brand}</Text>
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

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT (4%)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(vat)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>{formatCurrency(deliveryFee)}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: COLORS.success }]}>
                Discount
              </Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                -{formatCurrency(discountAmount)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomMeta}>
          <Text style={styles.bottomMetaLabel}>Amount to pay</Text>
          <Text style={styles.bottomMetaValue}>{formatCurrency(total)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, placingOrder && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={placingOrder}
          activeOpacity={0.9}
        >
          {placingOrder ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color={COLORS.white} />
              <Text style={styles.placeOrderText}>Place Order</Text>
            </>
          )}
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

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 4 : 8,
    paddingBottom: 12,
  },
  headerBtn: {
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
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
    color: COLORS.textMuted,
    fontWeight: '700',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 140,
  },

  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  linkText: {
    color: COLORS.sky,
    fontWeight: '800',
    fontSize: 13,
  },

  optionCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  optionCardActive: {
    borderColor: COLORS.tomato,
    backgroundColor: COLORS.tomatoSoft,
  },
  optionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.skySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  labelPillText: {
    color: COLORS.sky,
    fontSize: 11,
    fontWeight: '800',
  },
  addressName: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  addressText: {
    marginTop: 5,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  addressPhone: {
    marginTop: 4,
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '600',
  },

  addAddressBox: {
    marginTop: 8,
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  input: {
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    color: COLORS.textDark,
    fontSize: 14,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  primaryMiniBtn: {
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.tomato,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  primaryMiniBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },

  methodCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  methodSub: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  methodFee: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '800',
  },

  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applyBtn: {
    height: 50,
    paddingHorizontal: 18,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.sky,
  },
  applyBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  removeCouponBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.tomato,
  },
  appliedCouponBox: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  appliedCouponText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '800',
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
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  itemBrand: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  itemQty: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.sky,
    fontWeight: '700',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginLeft: 12,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.tomato,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bottomMeta: {
    marginBottom: 12,
  },
  bottomMetaLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  bottomMetaValue: {
    color: COLORS.textDark,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  placeOrderBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.dark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  placeOrderBtnDisabled: {
    opacity: 0.7,
  },
  placeOrderText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 16,
  },
});