import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, FlatList, Image, 
  TouchableOpacity, SafeAreaView, Dimensions, 
  TextInput, ScrollView 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2;

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Books', 'Gadgets'];

const PRODUCTS = [
  { id: '1', name: 'YsStore Noise-Cancelling', shop: 'YsStore HQ', price: '₦85,000', rating: 4.9, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', category: 'Electronics' },
  { id: '2', name: 'Infinity Knit', shop: 'Fashion Hub', price: '₦45,000', rating: 4.1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', category: 'Fashion' },
  { id: '3', name: 'Smart Coffee Maker', shop: 'Fastore HQ', price: '₦120,000', rating: 4.9, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500', category: 'Home' },
  { id: '4', name: 'Portable Power Bank', shop: 'Fastore Hub', price: '₦25,000', rating: 4.3, image: 'https://images.unsplash.com/photo-1609091839311-d53681962025?w=500', category: 'Electronics' },
  { id: '5', name: 'Leather Crossbody Bag', shop: 'Fashion Hub', price: '₦55,000', rating: 4.7, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', category: 'Fashion' },
  { id: '6', name: 'Digital Nomad’s Guide', shop: 'Books HQ', price: '₦12,500', rating: 4.8, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', category: 'Books' },
];

export default function ShopNowScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.shopName}>by {item.shop}</Text>
        <Text style={styles.productTitle} numberOfLines={1}>{item.name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{item.price}</Text>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop Now</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="search" size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="cart-outline" size={20} color="#0F172A" />
            <View style={styles.cartBadge}><Text style={styles.badgeText}>3</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      {/* CATEGORIES */}
      <View style={{ marginBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setSelectedCategory(cat)}
              style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnActive]}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* PRODUCT GRID */}
      <FlatList
        data={selectedCategory === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === selectedCategory)}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
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
    padding: 20 
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
  headerIcons: { flexDirection: 'row' },
  iconCircle: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', 
    justifyContent: 'center', alignItems: 'center', marginLeft: 10,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  cartBadge: { 
    position: 'absolute', top: -2, right: -2, 
    backgroundColor: '#FF6B6B', width: 16, height: 16, 
    borderRadius: 8, justifyContent: 'center', alignItems: 'center' 
  },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  categoryList: { paddingHorizontal: 20 },
  categoryBtn: { 
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, 
    backgroundColor: '#FFF', marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0' 
  },
  categoryBtnActive: { backgroundColor: '#2b2b2b', borderColor: '#ea5b5b' },
  categoryText: { color: '#64748B', fontWeight: '600' },
  categoryTextActive: { color: 'white' },

  gridContent: { paddingHorizontal: 15, paddingBottom: 100 },
  gridRow: { justifyContent: 'space-between' },
  productCard: { 
    backgroundColor: '#FFF', width: COLUMN_WIDTH, 
    borderRadius: 20, marginBottom: 15, overflow: 'hidden',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10
  },
  productImage: { width: '100%', height: 160, backgroundColor: '#F1F5F9' },
  productInfo: { padding: 12 },
  shopName: { fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' },
  productTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginVertical: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  ratingBox: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, marginLeft: 3, color: '#64748B', fontWeight: '600' },
  addButton: { 
    position: 'absolute', bottom: 12, right: 12, 
    backgroundColor: '#6ea8f3', width: 28, height: 28, 
    borderRadius: 14, justifyContent: 'center', alignItems: 'center' 
  }
});