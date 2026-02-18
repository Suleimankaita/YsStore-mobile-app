import React, { useState, useCallback, useRef } from 'react';
import { 
  StyleSheet, View, Text, TextInput, FlatList, Image, 
  TouchableOpacity, SafeAreaView, LayoutAnimation, 
  Platform, UIManager, RefreshControl, Animated, Dimensions 
} from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const SHOPS = [
  {
    id: '1',
    name: 'YsStore HQ',
    type: 'Company',
    banner: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=800&auto=format&fit=crop',
    logo: 'https://ui-avatars.com/api/?name=YS&background=0F172A&color=fff&size=128',
    rating: 4.8,
    location: 'Katsina State',
    description: 'Premier destination for high-end electronics.',
    isVerified: true,
  },
  {
    id: '2',
    name: 'SK Global',
    type: 'Company',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    logo: 'https://ui-avatars.com/api/?name=SK&background=334155&color=fff&size=128',
    rating: 4.5,
    location: 'Lagos Island',
    description: 'Logistics and corporate retail solutions.',
    isVerified: true,
  },
  {
    id: '3',
    name: 'Abdulrazaq Tech',
    type: 'Branch',
    banner: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&auto=format&fit=crop',
    logo: 'https://ui-avatars.com/api/?name=AT&background=1DA1F2&color=fff&size=128',
    rating: 4.2,
    location: 'Abuja, FCT',
    description: 'Mobile repairs and gadgets center.',
    isVerified: false,
  },
  {
    id: '4',
    name: 'Fashion Hub',
    type: 'Company',
    banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    logo: 'https://ui-avatars.com/api/?name=FH&background=E91E63&color=fff&size=128',
    rating: 4.9,
    location: 'Kano State',
    description: 'Exclusive designer wears and accessories.',
    isVerified: true,
  }
];

export default function ShopListPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isGridView, setIsGridView] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pull to refresh animation
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const toggleLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setIsGridView(!isGridView);
  };

  const handleFilterChange = (type) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilterType(type);
  };

  const filteredData = SHOPS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' ? true : item.type === filterType;
    return matchesSearch && matchesType;
  });

  const renderShopCard = ({ item }) => {
    if (isGridView) {
      return (
        <TouchableOpacity onPress={()=>router.push('(shop)/Shop')} style={styles.gridCard} activeOpacity={0.9}>
          <Image source={{ uri: item.banner }} style={styles.gridBanner} />
          <View style={styles.gridInfo}>
            <Image source={{ uri: item.logo }} style={styles.gridLogo} />
            <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.ratingRow}>
              <FontAwesome name="star" size={10} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={()=>router.push('(shop)/Shop')} style={styles.card} activeOpacity={0.9}>
        <Image source={{ uri: item.banner }} style={styles.banner} />
        <View style={[styles.typeTag, { backgroundColor: item.type === 'Company' ? '#0F172A' : '#E65100' }]}>
          <Text style={styles.typeTagText}>{item.type}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.logoContainer}>
            <Image source={{ uri: item.logo }} style={styles.logo} />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.shopName}>{item.name}</Text>
              {item.isVerified && <MaterialIcons name="verified" size={16} color="#1DA1F2" style={{ marginLeft: 4 }} />}
            </View>
            <View style={styles.ratingRow}>
              <FontAwesome name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <MaterialIcons name="location-on" size={14} color="#64748B" style={{ marginLeft: 10 }} />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
            <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore <Text style={{color: '#0F172A'}}>Shops</Text></Text>
        
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search by name..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.layoutToggle} onPress={toggleLayout}>
            <Ionicons name={isGridView ? "list-outline" : "grid-outline"} size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          {['All', 'Company', 'Branch'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabButton, filterType === tab && styles.tabButtonActive]}
              onPress={() => handleFilterChange(tab)}
            >
              <Text style={[styles.tabText, filterType === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderShopCard}
        keyExtractor={item => item.id}
        numColumns={isGridView ? 2 : 1}
        key={isGridView ? 'GRID' : 'LIST'}
        contentContainerStyle={styles.listPadding}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F172A" />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#64748B', marginBottom: 15 },
  
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 15, paddingHorizontal: 15, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#0F172A' },
  layoutToggle: { marginLeft: 12, width: 50, height: 50, backgroundColor: '#F1F5F9', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabButtonActive: { backgroundColor: '#FFF', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  tabText: { color: '#94A3B8', fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: '#0F172A' },

  listPadding: { padding: 16, paddingBottom: 100 },
  
  /* LIST STYLE */
  card: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 20, overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  banner: { width: '100%', height: 150 },
  typeTag: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  typeTagText: { fontSize: 10, fontWeight: 'bold', color: '#FFF', textTransform: 'uppercase' },
  cardContent: { padding: 15, flexDirection: 'row', alignItems: 'center' },
  logoContainer: { marginTop: -55, borderWidth: 4, borderColor: '#FFF', borderRadius: 35, backgroundColor: '#FFF', elevation: 5 },
  logo: { width: 64, height: 64, borderRadius: 32 },
  infoContainer: { flex: 1, marginLeft: 15 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  shopName: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  ratingText: { fontSize: 13, color: '#1E293B', marginLeft: 4, fontWeight: '700' },
  locationText: { fontSize: 13, color: '#64748B', marginLeft: 4 },
  description: { fontSize: 13, color: '#94A3B8' },

  /* GRID STYLE */
  gridCard: { width: (width - 48) / 2, backgroundColor: '#FFF', borderRadius: 15, marginBottom: 16, marginRight: 16, overflow: 'hidden', elevation: 3 },
  gridBanner: { width: '100%', height: 100 },
  gridInfo: { padding: 10, alignItems: 'center' },
  gridLogo: { width: 40, height: 40, borderRadius: 20, marginTop: -30, borderWidth: 2, borderColor: '#FFF' },
  gridName: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginTop: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94A3B8' }
});