import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { usePaystack } from 'react-native-paystack-webview';
const { width } = Dimensions.get('window');

// --- Dynamic Theme Colors ---
const getThemeColors = (colorScheme) => {
  const isDark = colorScheme === 'dark';
  return {
    red: '#E11D48',
    skyBlue: '#0EA5E9',
    bg: isDark ? '#0F172A' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    textMain: isDark ? '#F8FAFC' : '#0F172A',
    textSub: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
    inputBg: isDark ? '#0F172A' : '#F1F5F9',
    paystack: '#09A5DB', // Paystack Brand Color
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

export default function CartScreen() {
  const {popup} = usePaystack();
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getThemeColors(colorScheme), [colorScheme]);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [cartItems, setCartItems] = useState(INITIAL_CART);

  // --- Calculations ---
  const updateQty = (id, delta) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const vatAmount = subtotal * 0.04; // 4% VAT
  const total = subtotal + vatAmount;

  const pay = () => {
    popup.checkout({
      amount:  total * 100, // Paystack expects amount in kobo
      email: 'suleiman20015kaita@gmail.com',
      // currency: 'NGN',
      onSuccess: (response) => { 
        alert('Payment Successful! Reference: ' + response.reference);
        setCartItems([]); // Clear cart on successful payment
      } ,
      onCancel: () => alert('Payment Cancelled'),
    })
  }
  // --- Components ---
  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="cart-outline" size={60} color={theme.textSub} />
      </View>
      <Text style={styles.emptyTitle}>Empty Cart</Text>
      <Text style={styles.emptySubtitle}>Your shopping bag is waiting for some goodies.</Text>
      <TouchableOpacity style={styles.continueBtn} onPress={() => router.back()}>
        <Text style={styles.continueBtnText}>Go to Shop</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemBrand}>{item.brand}</Text>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          </View>
          <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
            <Ionicons name="close-circle" size={22} color={theme.textSub} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>₦{item.price.toLocaleString()}</Text>
          <View style={styles.qtyContainer}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
              <Ionicons name="remove" size={16} color={theme.textMain} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
              <Ionicons name="add" size={16} color={theme.textMain} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Order</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyCart}
        showsVerticalScrollIndicator={false}
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₦{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT (4%)</Text>
            <Text style={styles.summaryValue}>₦{vatAmount.toLocaleString()}</Text>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
          </View>

          <TouchableOpacity onPress={pay} style={styles.paystackBtn} activeOpacity={0.8}>
            <Image 
               source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Paystack_Logo.png/640px-Paystack_Logo.png' }} 
               style={styles.paystackLogo}
               resizeMode="contain"
            />
            <Text style={styles.paystackText}>Pay Now with Paystack</Text>
            <Ionicons name="lock-closed" size={16} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.card,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: theme.textMain },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },

  listContent: { padding: 20, paddingBottom: 40 },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  itemImage: { width: 85, height: 85, borderRadius: 18, backgroundColor: theme.bg },
  itemDetails: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemBrand: { fontSize: 10, fontWeight: '800', color: theme.skyBlue, textTransform: 'uppercase', letterSpacing: 1 },
  itemName: { fontSize: 16, fontWeight: '700', color: theme.textMain, marginTop: 2 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: 17, fontWeight: '900', color: theme.textMain },
  
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.inputBg,
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 8, backgroundColor: theme.card,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyText: { marginHorizontal: 12, fontWeight: '900', color: theme.textMain, fontSize: 14 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: theme.textMain },
  emptySubtitle: { fontSize: 14, color: theme.textSub, textAlign: 'center', paddingHorizontal: 60, marginTop: 8 },
  continueBtn: { marginTop: 25, backgroundColor: theme.textMain, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
  continueBtnText: { color: theme.card, fontWeight: '800' },

  footer: {
    backgroundColor: theme.card,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: theme.textSub, fontWeight: '600', fontSize: 14 },
  summaryValue: { color: theme.textMain, fontWeight: '700', fontSize: 14 },
  divider: { height: 1, backgroundColor: theme.border, marginVertical: 15, borderStyle: 'dashed' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontSize: 18, fontWeight: '800', color: theme.textMain },
  totalValue: { fontSize: 24, fontWeight: '900', color: theme.textMain },

  paystackBtn: {
    backgroundColor: '#323536', // Official Paystack blue
    flexDirection: 'row',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#2b2c2d',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  },
  paystackLogo: { width: 20, height: 20, marginRight: 10, tintColor: 'white' },
  paystackText: { color: 'white', fontSize: 16, fontWeight: '800' },
});