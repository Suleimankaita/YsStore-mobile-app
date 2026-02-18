import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, FlatList, Image, 
  TouchableOpacity, SafeAreaView, LayoutAnimation, 
  Platform, UIManager, Alert, Dimensions 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const INITIAL_DATA = [
  { id: '1', name: 'iPhone 15 Pro Max', shop: 'YsStore HQ', price: '1,200,000', image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400', inStock: true },
  { id: '2', name: 'Nike Air Force 1', shop: 'Fashion Hub', price: '85,000', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400', inStock: true },
  { id: '3', name: 'Sony WH-1000XM5', shop: 'Abdul Tech', price: '450,000', image: 'https://images.unsplash.com/photo-1618366712277-7ca833e9da5b?w=400', inStock: false },
];

export default function WishlistScreen() {
  const [wishlist, setWishlist] = useState(INITIAL_DATA);

  // --- FUNCTIONALITIES ---

  // 1. Remove Item with smooth transition
  const removeItem = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  // 2. Clear entire list
  const clearWishlist = () => {
    Alert.alert("Clear Wishlist", "Remove all saved items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove All", style: 'destructive', onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
          setWishlist([]);
      }}
    ]);
  };

  // 3. Add to Cart Logic
  const addToCart = (item) => {
    if (!item.inStock) {
      Alert.alert("Oops!", "This item is currently out of stock.");
      return;
    }
    Alert.alert("Added!", `${item.name} is now in your cart.`);
  };

  const renderWishlistItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      <View style={styles.infoContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.shopText}>{item.shop}</Text>
          <TouchableOpacity onPress={() => removeItem(item.id)}>
            <Feather name="x" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.priceText}>₦{item.price}</Text>

        <View style={styles.footerRow}>
          <View style={[styles.statusBadge, { backgroundColor: item.inStock ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={[styles.statusText, { color: item.inStock ? '#166534' : '#991B1B' }]}>
              {item.inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.cartButton, !item.inStock && styles.disabledButton]} 
            onPress={() => addToCart(item)}
          >
            <Ionicons name="cart-outline" size={16} color="white" />
            <Text style={styles.cartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <Text style={styles.headerSubtitle}>{wishlist.length} items you love</Text>
        </View>
        {wishlist.length > 0 && (
          <TouchableOpacity onPress={clearWishlist} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LIST SECTION */}
      <FlatList
        data={wishlist}
        keyExtractor={item => item.id}
        renderItem={renderWishlistItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={60} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyDesc}>
              Tap the heart icon on any product to save it for later.
            </Text>
            <TouchableOpacity style={styles.exploreBtn}>
              <Text style={styles.exploreBtnText}>Go Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: '#FFF' 
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
  clearBtn: { padding: 8 },
  clearBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },

  listContent: { padding: 20, paddingBottom: 100 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 12, 
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  productImage: { width: 90, height: 90, borderRadius: 15, backgroundColor: '#F1F5F9' },
  infoContainer: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shopText: { fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  productName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginVertical: 2 },
  priceText: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  
  cartButton: { 
    flexDirection: 'row', 
    backgroundColor: '#0F172A', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  disabledButton: { backgroundColor: '#CBD5E1' },
  cartButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 5, fontSize: 12 },

  // Empty State Styles
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  emptyDesc: { fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 10, paddingHorizontal: 40, lineHeight: 22 },
  exploreBtn: { marginTop: 25, backgroundColor: '#0F172A', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
  exploreBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});