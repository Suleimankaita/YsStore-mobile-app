import React, { useState, useMemo, useRef } from 'react';
import {
  StyleSheet, View, Text, Image, FlatList, TextInput,
  TouchableOpacity, Dimensions, SafeAreaView, StatusBar,
  Modal, ScrollView, Animated, Alert
} from 'react-native';
import { Search, ShoppingCart, Star, ChevronLeft, X, Plus, Check } from 'lucide-react-native';
import logo from '../../assets/images/Ys.png';
const { width, height } = Dimensions.get('window');

// --- Mock Data ---
const CATEGORIES = ['All', 'Shoes', 'Textiles', 'Jugs'];
const INITIAL_PRODUCTS = [
  { id: '1', name: 'Premium Slides', price: 25.00, category: 'Shoes', rating: 4.8, description: 'Ultra-soft foam cushioning for all-day comfort. Perfect for home or beach.', image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=500' },
  { id: '2', name: 'Cotton Textile', price: 15.00, category: 'Textiles', rating: 4.5, description: '100% organic cotton, breathable and durable for custom tailoring.', image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=500' },
  { id: '3', name: 'Ceramic Jug', price: 40.00, category: 'Jugs', rating: 4.9, description: 'Hand-crafted ceramic jug with a minimalist matte finish.', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=500' },
  { id: '4', name: 'Sport Sandals', price: 35.00, category: 'Shoes', rating: 4.7, description: 'Rugged grip soles designed for outdoor adventures and hiking.', image: 'https://images.unsplash.com/photo-1620138546344-7b2c38516edf?q=80&w=500' },
];

export default function YsStoreApp() {
  // --- States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isFollowing, setIsFollowing] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [followers, setFollowers] = useState(1240);

  // --- Logic: Filter Products ---
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'All' || item.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

  // --- Logic: Cart Actions ---
  const addToCart = (product) => {
    setCart([...cart, product]);
    Alert.alert("Added to Cart", `${product.name} is now in your basket!`);
    setSelectedProduct(null);
  };

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowers(prev => isFollowing ? prev - 1 : prev + 1);
  };

  // --- UI Components ---
  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => setSelectedProduct(item)}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <TouchableOpacity 
          style={styles.addSmallBtn} 
          onPress={() => addToCart(item)}
        >
          <Plus size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header & Search */}
      <View style={styles.headerTop}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search color="#999" size={18} />
            <TextInput 
              placeholder="Search products..." 
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.cartBtn}>
            <ShoppingCart color="#1A1A1A" size={24} />
            {cart.length > 0 && <View style={styles.cartBadge}><Text style={styles.badgeText}>{cart.length}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Shop Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <Image source={logo} style={styles.logo} />
            <View style={styles.profileStats}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>158</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>4.8</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.shopTitle}>YsStore <Check size={16} color="#3498db" /></Text>
          <Text style={styles.shopBio}>Premium essentials for your everyday lifestyle. Fast shipping nationwide.</Text>
          
          <TouchableOpacity 
            style={[styles.followBtn, isFollowing && styles.followingBtn]} 
            onPress={toggleFollow}
          >
            <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
              {isFollowing ? 'Following' : 'Follow Shop'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.catContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setActiveTab(cat)}
              style={[styles.catChip, activeTab === cat && styles.catChipActive]}
            >
              <Text style={[styles.catText, activeTab === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Product Grid */}
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No products found matching "{searchQuery}"</Text>}
        />
      </ScrollView>

      {/* --- Product Detail Modal --- */}
      <Modal visible={!!selectedProduct} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedProduct(null)}>
                  <X color="#000" size={24} />
                </TouchableOpacity>
                <Image source={{ uri: selectedProduct.image }} style={styles.modalImage} />
                <View style={styles.modalBody}>
                  <Text style={styles.modalCategory}>{selectedProduct.category}</Text>
                  <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                  <View style={styles.modalPriceRow}>
                    <Text style={styles.modalPrice}>${selectedProduct.price.toFixed(2)}</Text>
                    <View style={styles.ratingRow}><Star size={16} color="#FFD700" fill="#FFD700"/><Text> {selectedProduct.rating}</Text></View>
                  </View>
                  <Text style={styles.modalDesc}>{selectedProduct.description}</Text>
                  <TouchableOpacity style={styles.buyBtn} onPress={() => addToCart(selectedProduct)}>
                    <Text style={styles.buyBtnText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerTop: { padding: 16, backgroundColor: '#FFF' },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  cartBtn: { marginLeft: 15, position: 'relative' },
  cartBadge: { position: 'absolute', right: -6, top: -6, backgroundColor: '#E63946', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  profileSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  profileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  logo: { width: 70, height: 70, borderRadius: 20, backgroundColor: '#EEE' },
  profileStats: { flexDirection: 'row', flex: 1, justifyContent: 'space-around', marginLeft: 10 },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  statLabel: { fontSize: 12, color: '#888' },
  shopTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  shopBio: { fontSize: 14, color: '#666', marginTop: 5, lineHeight: 20 },
  followBtn: { backgroundColor: '#1A1A1A', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 15 },
  followingBtn: { backgroundColor: '#F0F0F0' },
  followBtnText: { color: '#FFF', fontWeight: 'bold' },
  followingBtnText: { color: '#1A1A1A' },

  catContainer: { flexDirection: 'row', padding: 16 },
  catChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5F5F5', marginRight: 10 },
  catChipActive: { backgroundColor: '#E63946' },
  catText: { color: '#666', fontWeight: '500' },
  catTextActive: { color: '#FFF' },

  gridContainer: { paddingHorizontal: 10 },
  gridRow: { justifyContent: 'space-between' },
  productCard: { width: (width / 2) - 20, backgroundColor: '#FFF', borderRadius: 15, marginBottom: 20, padding: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  productImage: { width: '100%', height: 140, borderRadius: 12 },
  productInfo: { marginTop: 10, position: 'relative' },
  productName: { fontSize: 14, fontWeight: '600', width: '80%' },
  productPrice: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  addSmallBtn: { position: 'absolute', right: 0, bottom: 0, backgroundColor: '#1A1A1A', borderRadius: 8, padding: 5 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: height * 0.8 },
  closeBtn: { position: 'absolute', top: 20, right: 20, zIndex: 10, backgroundColor: '#FFF', borderRadius: 20, padding: 5 },
  modalImage: { width: '100%', height: 350, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalBody: { padding: 25 },
  modalCategory: { color: '#E63946', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 },
  modalTitle: { fontSize: 26, fontWeight: 'bold', marginVertical: 8 },
  modalPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalPrice: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  modalDesc: { color: '#777', marginTop: 15, lineHeight: 22, fontSize: 15 },
  buyBtn: { backgroundColor: '#1A1A1A', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  buyBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});