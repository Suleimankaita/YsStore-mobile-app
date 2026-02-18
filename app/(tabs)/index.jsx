import React, { useState, useEffect, memo, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ImageBackground, // Added ImageBackground
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
  StatusBar,
  FlatList,
  Platform,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme'; 
import { router } from 'expo-router';

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
    searchBg: isDark ? '#0F172A' : '#F1F5F9',
    icon: isDark ? '#F8FAFC' : '#0F172A',
    followBg: isDark ? '#082F49' : '#F0F9FF',
  };
};

// --- Isolated Timer Component ---
const CountdownTimer = memo(({ theme, styles }) => {
  const [timeLeft, setTimeLeft] = useState(3600 * 4);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.timerBadge, { backgroundColor: theme.red }]}>
      <Ionicons name="time-outline" size={14} color="white" />
      <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
    </View>
  );
});

// --- UPDATED Mock Data for Banner (Real Life Images) ---
const HERO_BANNERS = [
  { 
    id: 'h1', 
    title: 'Season Finale', 
    subtitle: '50% OFF Tools', 
    bg: '#0EA5E9', 
    btnText: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80' 
  },
  { 
    id: 'h2', 
    title: 'Tech Week', 
    subtitle: 'New Gadgets', 
    bg: '#8B5CF6', 
    btnText: 'Discover',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80' 
  },
  { 
    id: 'h3', 
    title: 'Auto Parts', 
    subtitle: 'Upgrade Your Ride', 
    bg: '#F59E0B', 
    btnText: 'Explore',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80' 
  }
];

const CATEGORIES = [
  { id: '1', name: 'Food', icon: 'fast-food-outline', color: '#FFedd5', darkColor: '#7c2d12' },
  { id: '2', name: 'POS', icon: 'calculator-outline', color: '#fee2e2', darkColor: '#7f1d1d' },
  { id: '3', name: 'Gadgets', icon: 'laptop-outline', color: '#dcfce7', darkColor: '#14532d' },
  { id: '4', name: 'Industrial', icon: 'construct-outline', color: '#fef9c3', darkColor: '#713f12' },
  { id: '5', name: 'Fashion', icon: 'shirt-outline', color: '#f3e8ff', darkColor: '#4c1d95' },
];

const SHOPS = [
  { id: 'st1', name: 'YS Industrial', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200', category: 'Tools', isLive: true },
  { id: 'st2', name: 'Gadget Hub', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200', category: 'Tech', isLive: false },
  { id: 'st3', name: 'Elite Fashion', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200', category: 'Style', isLive: true },
  { id: 'st4', name: 'Auto Part Pro', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200', category: 'Cars', isLive: false },
];

const DAILY_DROPS = [
  { id: 'd1', name: 'Limited Edition Drone', brand: 'DJI Global', image: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=400', stock: 'Only 5 left' },
  { id: 'd2', name: 'Cyber Shoes X', brand: 'Nike Branch', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', stock: 'Dropping soon' },
];

const BEST_SALES = [
  { id: 's1', name: 'MacBook M3 Pro', brand: 'Apple Store', discount: '25%', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400' },
  { id: 's2', name: 'OLED TV 65"', brand: 'LG Electronics', discount: '40%', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400' },
  { id: 's3', name: 'Smart Watch 9', brand: 'Samsung HQ', discount: '15%', image: 'https://images.unsplash.com/photo-1544117518-30df578096a4?w=400' },
];

const RECOMMENDED = [
  { id: '1', name: 'Industrial Gear Set', brand: 'YS Industrial', price: '85,000', rating: '4.8', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400' },
  { id: '2', name: 'Premium Espresso', brand: 'BrewMaster', price: '35,000', rating: '4.9', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400' },
  { id: '3', name: '4K Projector Pro', brand: 'Sony Center', price: '120,000', rating: '4.7', image: 'https://images.unsplash.com/photo-1535016120720-40c646bebbfc?w=400' },
  { id: '4', name: 'Gaming Monitor', brand: 'Asus ROG', price: '95,000', rating: '4.5', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400' },
];

export default function YSStoreProApp() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getThemeColors(colorScheme), [colorScheme]);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [followedIds, setFollowedIds] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  
  const bannerRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const toggleFollow = (id) => {
    setFollowedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveBanner(viewableItems[0].index);
    }
  }).current;

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = activeBanner + 1;
      if (nextIndex >= HERO_BANNERS.length) {
        nextIndex = 0;
      }
      bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 4000); 

    return () => clearInterval(interval);
  }, [activeBanner]);

  const followedShopsData = SHOPS.filter(shop => followedIds.includes(shop.id));

  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.gridProductCard} onPress={() => router.push('(PDP)/PDP')}>
      <Image source={{ uri: item.image }} style={styles.gridImg} />
      <View style={styles.gridInfo}>
        <View style={styles.brandRow}>
          <Ionicons name="storefront" size={10} color={theme.textSub} />
          <Text style={styles.companyName} numberOfLines={1}>{item.brand}</Text>
        </View>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemPrice}>₦{item.price}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <TouchableOpacity style={styles.gridAddBtn}>
            <Ionicons name="add" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const HeaderComponent = () => (
    <>
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={bannerRef}
          data={HERO_BANNERS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.9, 1, 0.9],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.6, 1, 0.6],
              extrapolate: 'clamp',
            });

            return (
              <View style={styles.heroBannerWrapper}>
                <Animated.View style={[styles.heroBanner, { transform: [{ scale }], opacity }]}>
                  {/* Image Background encompassing the whole card */}
                  <ImageBackground 
                    source={{ uri: item.image }} 
                    style={styles.bannerImageBg}
                    imageStyle={{ borderRadius: 24 }}
                    resizeMode="cover"
                  >
                    {/* Dark Overlay to make text readable */}
                    <View style={styles.imageOverlay}>
                        {/* Decorative Circles */}
                        <View style={[styles.decorativeCircle, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
                        <View style={[styles.decorativeCircleSmall, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                        
                        {/* Content Layout */}
                        <View style={styles.bannerContent}>
                            <View style={styles.textColumn}>
                                <View style={styles.newBadge}>
                                    <Text style={styles.newBadgeText}>NEW ARRIVAL</Text>
                                </View>
                                <Text style={styles.heroTitle} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.heroSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                                <TouchableOpacity style={styles.shopNowBtn}>
                                    <Text style={styles.shopNowText}>{item.btnText}</Text>
                                    <Ionicons name="arrow-forward" size={14} color="white" style={{marginLeft: 4}}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                  </ImageBackground>
                </Animated.View>
              </View>
            );
          }}
        />
        
        <View style={styles.paginationDots}>
          {HERO_BANNERS.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: 'clamp',
            });
            
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View 
                key={i} 
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity, backgroundColor: theme.textMain }]} 
              />
            );
          })}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.id} style={styles.catItemContainer}>
            <View style={[styles.catIconBox, { backgroundColor: colorScheme === 'dark' ? cat.darkColor : cat.color }]}>
              <Ionicons name={cat.icon} size={24} color={colorScheme === 'dark' ? 'white' : '#0F172A'} />
            </View>
            <Text style={styles.catText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {followedShopsData.length > 0 && (
        <View style={styles.followedContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Following</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
            {followedShopsData.map((shop) => (
              <TouchableOpacity key={shop.id} style={styles.followedCircleCard}>
                <View>
                  <Image source={{ uri: shop.image }} style={styles.followedAvatar} />
                  {shop.isLive ? (
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  ) : (
                    <View style={styles.onlineDot} />
                  )}
                </View>
                <Text style={styles.followedName} numberOfLines={1}>{shop.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Shops</Text>
        <TouchableOpacity><Text style={styles.seeAll}>Explore</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
        {SHOPS.map((shop) => (
          <View key={shop.id} style={styles.shopCard}>
            <Image source={{ uri: shop.image }} style={styles.shopAvatar} />
            <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
            <TouchableOpacity
              onPress={() => toggleFollow(shop.id)}
              style={[styles.followBtn, followedIds.includes(shop.id) && styles.followedBtnActive]}
            >
              <Text style={[styles.followText, followedIds.includes(shop.id) && { color: 'white' }]}>
                {followedIds.includes(shop.id) ? 'Following' : '+ Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.sectionHeader, { marginTop: 10 }]}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Daily Drop</Text>
          <CountdownTimer theme={theme} styles={styles} />
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
        {DAILY_DROPS.map((drop) => (
          <View key={drop.id} style={styles.dropCard}>
            <Image source={{ uri: drop.image }} style={styles.dropImg} />
            <View style={styles.dropContent}>
              <View style={styles.brandRow}>
                <Ionicons name="business" size={12} color={theme.skyBlue} />
                <Text style={styles.dropBrand}>{drop.brand}</Text>
              </View>
              <Text style={styles.dropTitle} numberOfLines={1}>{drop.name}</Text>
              <View style={styles.dropFooter}>
                <Text style={styles.dropStock}>{drop.stock}</Text>
                <TouchableOpacity style={styles.dropBtn}>
                  <Text style={styles.dropBtnText}>Get Notified</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.sectionHeader, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Best Sales</Text>
        <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
        {BEST_SALES.map((sale) => (
          <TouchableOpacity key={sale.id} style={styles.saleCard}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{sale.discount} OFF</Text>
            </View>
            <Image source={{ uri: sale.image }} style={styles.saleImg} />
            <View style={styles.saleInfo}>
              <Text style={styles.companyName} numberOfLines={1}>{sale.brand}</Text>
              <Text style={styles.saleTitle} numberOfLines={1}>{sale.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.sectionHeader, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.card} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.row}>
            <Text style={[styles.logoText, { color: theme.textMain }]}>✦ Ys</Text>
            <Text style={[styles.logoText, { color: theme.red }]}>Store</Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => router.push('(notification)/notification')}>
              <Ionicons name="notifications-outline" size={24} color={theme.icon} style={{ marginRight: 15 }} />
            </TouchableOpacity>
            <View>
              <TouchableOpacity onPress={() => router.push("/(Cart)/Cart")}>
                <Ionicons name="cart-outline" size={26} color={theme.icon} />
              </TouchableOpacity>
              <View style={styles.cartBadge}><Text style={styles.badgeText}>5</Text></View>
            </View>
          </View>
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={theme.textSub} style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search products, brands, shops..."
            placeholderTextColor={theme.textSub}
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={RECOMMENDED}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        ListHeaderComponent={HeaderComponent}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  row: { flexDirection: 'row', alignItems: 'center' },

  header: {
    backgroundColor: theme.card, paddingHorizontal: 16, paddingBottom: 15, paddingTop: Platform.OS === 'android' ? 10 : 0,
    borderBottomWidth: 1, borderColor: theme.border
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  logoText: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  cartBadge: {
    position: 'absolute', right: -6, top: -6, backgroundColor: theme.red,
    borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: theme.card
  },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  searchBar: {
    backgroundColor: theme.searchBg, borderRadius: 14, flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 15, height: 48,
  },
  searchInput: { flex: 1, fontSize: 14, color: theme.textMain, fontWeight: '500' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 15 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: theme.textMain },
  seeAll: { color: theme.skyBlue, fontWeight: '700', fontSize: 13 },
  horizontalList: { paddingLeft: 16, marginBottom: 25 },

  carouselContainer: { 
    marginTop: 20, 
    marginBottom: 20,
  },
  heroBannerWrapper: {
    width: width, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  heroBanner: { 
    width: width - 32, 
    height: 180,
    borderRadius: 24, 
    overflow: 'hidden', 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOpacity: 0.3, 
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  bannerImageBg: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent overlay for text readability
    padding: 20,
    justifyContent: 'center',
  },
  decorativeCircle: {
      position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: 70
  },
  decorativeCircleSmall: {
      position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40
  },
  bannerContent: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1
  },
  textColumn: { flex: 1, justifyContent: 'center', zIndex: 1 },
  newBadge: {
      backgroundColor: theme.red, paddingHorizontal: 8, paddingVertical: 4,
      borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8
  },
  newBadgeText: { color: 'white', fontSize: 10, fontWeight: '800' },
  heroTitle: { color: 'white', fontSize: 26, fontWeight: '900', marginBottom: 4 },
  heroSubtitle: { color: 'rgba(255,255,255,0.95)', fontSize: 15, fontWeight: '600', marginBottom: 14 },
  shopNowBtn: { 
      backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 10, 
      borderRadius: 30, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center' 
  },
  shopNowText: { color: '#0F172A', fontWeight: 'bold', fontSize: 12 },
  paginationDots: { 
      position: 'absolute', bottom: -15, width: '100%', flexDirection: 'row', justifyContent: 'center',
      alignItems: 'center', height: 10 
  },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },

  catScroll: { paddingLeft: 16, marginBottom: 25 },
  catItemContainer: { alignItems: 'center', marginRight: 22 },
  catIconBox: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catText: { color: theme.textSub, fontWeight: '700', fontSize: 12 },

  followedCircleCard: { marginRight: 18, alignItems: 'center' },
  followedAvatar: { width: 65, height: 65, borderRadius: 32.5, borderWidth: 2, borderColor: theme.skyBlue },
  onlineDot: { position: 'absolute', right: 2, bottom: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2, borderColor: theme.card },
  liveBadge: { 
    position: 'absolute', bottom: -5, alignSelf: 'center', backgroundColor: theme.red, 
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1.5, borderColor: theme.card 
  },
  liveText: { color: 'white', fontSize: 9, fontWeight: '900' },
  followedName: { fontSize: 12, fontWeight: '700', marginTop: 8, color: theme.textMain },

  shopCard: { 
    width: 120, backgroundColor: theme.card, borderRadius: 20, 
    padding: 14, marginRight: 15, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    borderWidth: 1, borderColor: theme.border
  },
  shopAvatar: { width: 54, height: 54, borderRadius: 27, marginBottom: 10 },
  shopName: { fontWeight: '800', fontSize: 13, color: theme.textMain, marginBottom: 10 },
  followBtn: { backgroundColor: theme.followBg, paddingVertical: 8, borderRadius: 10, width: '100%', alignItems: 'center' },
  followedBtnActive: { backgroundColor: theme.skyBlue },
  followText: { fontSize: 11, fontWeight: '800', color: theme.skyBlue },

  timerBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginLeft: 10 },
  timerText: { color: 'white', fontWeight: 'bold', fontSize: 12, marginLeft: 4, fontVariant: ['tabular-nums'] },

  dropCard: { 
    width: 280, backgroundColor: theme.card, borderRadius: 24, marginRight: 16, 
    overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5,
    borderWidth: 1, borderColor: theme.border
  },
  dropImg: { width: '100%', height: 140, backgroundColor: theme.bg },
  dropContent: { padding: 15 },
  dropBrand: { fontSize: 11, fontWeight: '700', color: theme.skyBlue, marginLeft: 4 },
  dropTitle: { fontSize: 18, fontWeight: '900', color: theme.textMain, marginTop: 4, marginBottom: 10 },
  dropFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropStock: { fontSize: 12, fontWeight: '600', color: theme.red },
  dropBtn: { backgroundColor: theme.icon, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  dropBtnText: { color: theme.card, fontSize: 11, fontWeight: 'bold' },

  saleCard: { width: 140, backgroundColor: theme.card, borderRadius: 20, marginRight: 15, padding: 10, elevation: 2, borderWidth: 1, borderColor: theme.border },
  saleImg: { width: '100%', height: 110, borderRadius: 12, backgroundColor: theme.bg, marginBottom: 10 },
  discountBadge: { position: 'absolute', top: 15, left: 15, backgroundColor: theme.red, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, zIndex: 1 },
  discountText: { color: 'white', fontSize: 10, fontWeight: '900' },
  saleInfo: { paddingHorizontal: 4 },
  companyName: { fontSize: 10, fontWeight: '700', color: theme.textSub, marginLeft: 4 },
  saleTitle: { fontSize: 13, fontWeight: '800', color: theme.textMain, marginTop: 2 },

  gridProductCard: {
    backgroundColor: theme.card, width: (width / 2) - 24, marginHorizontal: 12,
    marginBottom: 20, borderRadius: 20, overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, borderWidth: 1, borderColor: theme.border
  },
  gridImg: { width: '100%', height: 160, backgroundColor: theme.bg },
  gridInfo: { padding: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemName: { fontSize: 14, fontWeight: '700', color: theme.textMain, marginBottom: 4 },
  itemPrice: { fontSize: 17, fontWeight: '900', color: theme.textMain },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 11, fontWeight: '600', color: theme.textSub, marginLeft: 4 },
  gridAddBtn: {
    backgroundColor: theme.red, width: 30, height: 30, borderRadius: 10, 
    justifyContent: 'center', alignItems: 'center'
  },
});