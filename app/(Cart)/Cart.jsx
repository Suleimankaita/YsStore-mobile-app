import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';

const CART_STORAGE_KEY = '@ysstore_cart';

const getThemeColors = (colorScheme) => {
  const isDark = colorScheme === 'dark';

  return {
    tomato: '#FF6347',
    tomatoSoft: isDark ? 'rgba(255,99,71,0.14)' : '#FFE5E0',
    skyBlue: '#38BDF8',
    skyBlueSoft: isDark ? 'rgba(56,189,248,0.14)' : '#E0F2FE',

    bg: isDark ? '#0B1220' : '#F8FAFC',
    card: isDark ? '#111827' : '#FFFFFF',
    cardSoft: isDark ? '#172033' : '#F8FAFC',

    textMain: isDark ? '#F8FAFC' : '#0F172A',
    textSub: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#243041' : '#E2E8F0',
    line: isDark ? '#1E293B' : '#E5E7EB',

    success: '#10B981',
    danger: '#EF4444',
    darkBtn: '#111827',
  };
};

const INITIAL_CART = [
  {
    id: '1',
    name: 'Industrial Gear Set',
    brand: 'YS Industrial',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
    qty: 1,
  },
  {
    id: '2',
    name: 'MacBook M3 Pro',
    brand: 'Apple Store',
    price: 1250000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    qty: 1,
  },
  {
    id: '3',
    name: 'Smart Watch 9',
    brand: 'Samsung HQ',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1544117518-30df578096a4?w=400',
    qty: 2,
  },
];

const formatCurrency = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getThemeColors(colorScheme), [colorScheme]);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          setCartItems(JSON.parse(stored));
        } else {
          setCartItems(INITIAL_CART);
        }
      } catch (error) {
        setCartItems(INITIAL_CART);
      } finally {
        setLoadingCart(false);
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    if (!loadingCart) {
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems)).catch(() => {});
    }
  }, [cartItems, loadingCart]);

  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );

  const vatAmount = subtotal * 0.04;
  const deliveryFee = cartItems.length > 0 ? 3500 : 0;

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

  const grandTotal = Math.max(0, subtotal + vatAmount + deliveryFee - discountAmount);

  const updateQty = useCallback((id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((id) => {
    Alert.alert(
      'Remove item',
      'Are you sure you want to remove this item from the cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setCartItems((prev) => prev.filter((item) => item.id !== id));
          },
        },
      ]
    );
  }, []);

  const clearCart = useCallback(() => {
    if (!cartItems.length) return;

    Alert.alert(
      'Clear cart',
      'This will remove all items from your cart.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: async () => {
            setCartItems([]);
            setAppliedCoupon(null);
            setCoupon('');
            await AsyncStorage.removeItem(CART_STORAGE_KEY).catch(() => {});
          },
        },
      ]
    );
  }, [cartItems.length]);

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

    Alert.alert('Invalid coupon', 'This coupon code is not valid.');
  }, [coupon]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCoupon('');
  }, []);

  const handleProceedToCheckout = useCallback(() => {
    if (!cartItems.length) {
      Alert.alert('Cart is empty', 'Add some items before checkout.');
      return;
    }

    router.push({
      pathname: '(Checkout)/CheckOut',
      params: {
        subtotal: String(subtotal),
        vat: String(vatAmount),
        deliveryFee: String(deliveryFee),
        discount: String(discountAmount),
        total: String(grandTotal),
        itemCount: String(itemCount),
        coupon: appliedCoupon?.code || '',
      },
    });
  }, [
    cartItems.length,
    subtotal,
    vatAmount,
    deliveryFee,
    discountAmount,
    grandTotal,
    itemCount,
    appliedCoupon,
  ]);

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="cart-outline" size={58} color={theme.tomato} />
      </View>

      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>
        Add products to your cart and they will appear here for checkout.
      </Text>

      <TouchableOpacity style={styles.shopBtn} onPress={() => router.back()}>
        <Ionicons name="storefront-outline" size={18} color="#fff" />
        <Text style={styles.shopBtnText}>Go to Shop</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = ({ item }) => {
    const itemTotal = item.price * item.qty;

    return (
      <View style={styles.cartCard}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />

        <View style={styles.itemDetails}>
          <View style={styles.itemTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.brandBadge}>
                <Text style={styles.itemBrand}>{item.brand}</Text>
              </View>

              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>

              <Text style={styles.unitPrice}>
                Unit Price: {formatCurrency(item.price)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              style={styles.deleteBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color={theme.tomato} />
            </TouchableOpacity>
          </View>

          <View style={styles.itemBottomRow}>
            <View style={styles.qtyContainer}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.id, -1)}
                activeOpacity={0.8}
              >
                <Ionicons name="remove" size={16} color={theme.textMain} />
              </TouchableOpacity>

              <Text style={styles.qtyText}>{item.qty}</Text>

              <TouchableOpacity
                style={[styles.qtyBtn, styles.qtyBtnAdd]}
                onPress={() => updateQty(item.id, 1)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.totalPill}>
              <Text style={styles.itemTotal}>{formatCurrency(itemTotal)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loadingCart) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={theme.tomato} />
        <Text style={{ marginTop: 12, color: theme.textSub, fontWeight: '700' }}>
          Loading cart...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.textMain} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.clearHeaderBtn}
          onPress={clearCart}
          disabled={!cartItems.length}
          activeOpacity={0.8}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={cartItems.length ? theme.tomato : theme.textSub}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyCart}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          cartItems.length ? (
            <View style={styles.topInfoCard}>
              <Text style={styles.topInfoTitle}>Review your order</Text>
              <Text style={styles.topInfoText}>
                Check your items, apply coupon, and continue to checkout.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={cartItems.length ? <View style={{ height: 360 }} /> : null}
      />

      {cartItems.length > 0 && (
        <View style={styles.footerWrap}>
          <View style={styles.footerHandle} />

          <View style={styles.footerCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.couponRow}>
              <TextInput
                value={coupon}
                onChangeText={setCoupon}
                placeholder="Enter coupon code"
                placeholderTextColor={theme.textSub}
                style={styles.couponInput}
                autoCapitalize="characters"
              />

              {appliedCoupon ? (
                <TouchableOpacity style={styles.removeCouponBtn} onPress={removeCoupon}>
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.applyCouponBtn} onPress={applyCoupon}>
                  <Text style={styles.applyCouponText}>Apply</Text>
                </TouchableOpacity>
              )}
            </View>

            {appliedCoupon && (
              <View style={styles.appliedCouponBox}>
                <Ionicons name="pricetag-outline" size={16} color={theme.success} />
                <Text style={styles.appliedCouponText}>
                  Coupon {appliedCoupon.code} applied
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT (4%)</Text>
              <Text style={styles.summaryValue}>{formatCurrency(vatAmount)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{formatCurrency(deliveryFee)}</Text>
            </View>

            {discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.success }]}>Discount</Text>
                <Text style={[styles.summaryValue, { color: theme.success }]}>
                  -{formatCurrency(discountAmount)}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalSubtext}>Continue to secure checkout</Text>
              </View>

              <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleProceedToCheckout}
              activeOpacity={0.9}
            >
              <>
                <Ionicons name="arrow-forward-circle-outline" size={18} color="#fff" />
                <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              </>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bg,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 14,
    },
    backBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.textMain,
    },
    headerSubtitle: {
      fontSize: 12,
      marginTop: 2,
      color: theme.textSub,
      fontWeight: '700',
    },
    clearHeaderBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },

    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },

    topInfoCard: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    topInfoTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.textMain,
    },
    topInfoText: {
      marginTop: 6,
      fontSize: 13,
      color: theme.textSub,
      lineHeight: 20,
      fontWeight: '600',
    },

    cartCard: {
      flexDirection: 'row',
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    itemImage: {
      width: 92,
      height: 92,
      borderRadius: 20,
      backgroundColor: theme.cardSoft,
    },
    itemDetails: {
      flex: 1,
      marginLeft: 14,
      justifyContent: 'space-between',
    },
    itemTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    brandBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.skyBlueSoft,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      marginBottom: 8,
    },
    itemBrand: {
      color: theme.skyBlue,
      fontSize: 10,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.textMain,
      lineHeight: 22,
    },
    unitPrice: {
      marginTop: 6,
      fontSize: 12,
      color: theme.textSub,
      fontWeight: '600',
    },
    deleteBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.tomatoSoft,
      marginLeft: 10,
    },

    itemBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    qtyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardSoft,
      borderRadius: 14,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    qtyBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    qtyBtnAdd: {
      backgroundColor: theme.tomato,
      borderColor: theme.tomato,
    },
    qtyText: {
      minWidth: 34,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: '900',
      color: theme.textMain,
      marginHorizontal: 8,
    },
    totalPill: {
      backgroundColor: theme.tomatoSoft,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 14,
    },
    itemTotal: {
      fontSize: 14,
      fontWeight: '900',
      color: theme.tomato,
    },

    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      paddingHorizontal: 24,
    },
    emptyIconWrap: {
      width: 110,
      height: 110,
      borderRadius: 60,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.textMain,
    },
    emptySubtitle: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 22,
      color: theme.textSub,
      textAlign: 'center',
      maxWidth: 320,
    },
    shopBtn: {
      marginTop: 24,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.tomato,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 16,
      gap: 8,
    },
    shopBtnText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
    },

    footerWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 12,
      paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    },
    footerHandle: {
      alignSelf: 'center',
      width: 56,
      height: 5,
      borderRadius: 10,
      backgroundColor: theme.border,
      marginBottom: 10,
    },
    footerCard: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderBottomLeftRadius: 26,
      borderBottomRightRadius: 26,
      padding: 22,
      borderWidth: 1,
      borderColor: theme.border,
    },

    summaryTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.textMain,
      marginBottom: 14,
    },

    couponRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    couponInput: {
      flex: 1,
      height: 50,
      borderRadius: 14,
      backgroundColor: theme.cardSoft,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 14,
      color: theme.textMain,
      fontWeight: '700',
      marginRight: 10,
    },
    applyCouponBtn: {
      height: 50,
      paddingHorizontal: 18,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.skyBlue,
    },
    applyCouponText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 14,
    },
    removeCouponBtn: {
      width: 50,
      height: 50,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.tomato,
    },
    appliedCouponBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardSoft,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 14,
      gap: 8,
    },
    appliedCouponText: {
      color: theme.success,
      fontWeight: '800',
      fontSize: 13,
    },

    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    summaryLabel: {
      color: theme.textSub,
      fontSize: 14,
      fontWeight: '700',
    },
    summaryValue: {
      color: theme.textMain,
      fontSize: 14,
      fontWeight: '800',
    },

    divider: {
      height: 1,
      backgroundColor: theme.line,
      marginVertical: 12,
    },

    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.textMain,
    },
    totalSubtext: {
      marginTop: 4,
      fontSize: 12,
      color: theme.textSub,
      fontWeight: '600',
    },
    totalValue: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.tomato,
    },

    checkoutBtn: {
      height: 58,
      borderRadius: 18,
      backgroundColor: theme.darkBtn,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    checkoutBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '900',
    },
  });