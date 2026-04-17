import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import SaveItem from "@/utils/SaveItem";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

const COLORS = {
  tomato: "#FF6347",
  tomatoSoft: "#FFE6E1",
  sky: "#38BDF8",
  skySoft: "#E0F7FF",
  white: "#FFFFFF",
  textDark: "#1F2937",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  bg: "#F8FCFF",
  success: "#16A34A",
};

const initialWishlist = [
  {
    id: "1",
    name: "Wireless Bluetooth Headset",
    category: "Headsets",
    price: 18500,
    oldPrice: 25000,
    stock: 12,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Smart Wrist Watch Pro",
    category: "Watches",
    price: 32000,
    oldPrice: 40000,
    stock: 8,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Fast Charge Power Bank",
    category: "Accessories",
    price: 17000,
    oldPrice: 21000,
    stock: 14,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Sky Max Android Phone",
    category: "Phones",
    price: 125000,
    oldPrice: 145000,
    stock: 5,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
  },
];

const WishlistItem = ({ item, index, onRemove, onAddToCart, onOpen }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.98, { damping: 14, stiffness: 180 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 180 });
  };

  const discount = Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100);

  const renderRightActions = () => (
    <Animated.View entering={SlideInRight.duration(250)} style={styles.swipeActions}>
      <TouchableOpacity style={styles.swipeDeleteBtn} onPress={() => onRemove(item.id)}>
        <Ionicons name="trash-outline" size={22} color={COLORS.white} />
        <Text style={styles.swipeDeleteText}>Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <Animated.View
        entering={FadeInDown.delay(index * 80).springify()}
        layout={Layout.springify()}
        style={animatedStyle}
      >
        <TouchableOpacity
          activeOpacity={0.96}
          onPress={() => onOpen(item)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={styles.card}
        >
          <View style={styles.imageWrap}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.08)"]}
              style={styles.imageOverlay}
            />
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.topRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
              <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.heartBtn}>
                <Ionicons name="heart" size={18} color={COLORS.tomato} />
              </TouchableOpacity>
            </View>

            <Text numberOfLines={2} style={styles.productName}>
              {item.name}
            </Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={COLORS.tomato} />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.stockText}>
                • {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>
              <Text style={styles.oldPrice}>₦{item.oldPrice.toLocaleString()}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(item.id)}>
                <Ionicons name="trash-outline" size={16} color={COLORS.tomato} />
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cartBtn}
                onPress={() => onAddToCart(item)}
                disabled={item.stock < 1}
              >
                <Ionicons name="cart-outline" size={17} color={COLORS.white} />
                <Text style={styles.cartBtnText}>
                  {item.stock < 1 ? "Unavailable" : "Add to Cart"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );
};

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [cartCount, setCartCount] = useState(0);

  const filters = ["All", "Phones", "Headsets", "Watches", "Accessories"];

  const filteredWishlist = useMemo(() => {
    let list = [...wishlist];

    if (selectedFilter !== "All") {
      list = list.filter((item) => item.category === selectedFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [wishlist, search, selectedFilter]);

  const totalValue = useMemo(() => {
    return wishlist.reduce((sum, item) => sum + item.price, 0);
  }, [wishlist]);

  const removeItem = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const addToCart = (item) => {
    // if (item.stock < 1) {
    //   Alert.alert("Unavailable", "This item is out of stock.");
    //   return;
    // }
    SaveItem({ item, name: "cart" });
    setCartCount((prev) => prev + 1);
    Alert.alert("Cart Updated", `${item.name} added to cart.`);
  };

  const openProduct = (item) => {
    router.push({
      pathname: "/app/(PDP)/[id]",
      params: { id: item.id },
    });
  };

  const clearWishlist = () => {
    if (!wishlist.length) return;
    setWishlist([]);
  };

  const moveAllToCart = () => {
    const availableItems = wishlist.filter((item) => item.stock > 0);
    if (!availableItems.length) {
      Alert.alert("No Available Items", "There are no available wishlist items to add.");
      return;
    }
    setCartCount((prev) => prev + availableItems.length);
    Alert.alert("Success", `${availableItems.length} item(s) added to cart.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tomato} />

      <LinearGradient
        colors={[COLORS.tomato, COLORS.sky]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>My Wishlist</Text>
            <Text style={styles.headerSubTitle}>{wishlist.length} saved item(s)</Text>
          </View>

          <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert("Cart", `${cartCount} item(s) in cart.`)}>
            <Ionicons name="cart-outline" size={22} color={COLORS.white} />
            {cartCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <View style={styles.summaryIconWrap}>
              <Ionicons name="heart" size={22} color={COLORS.tomato} />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Saved Value</Text>
              <Text style={styles.summaryValue}>₦{totalValue.toLocaleString()}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.moveAllBtn} onPress={moveAllToCart}>
            <Text style={styles.moveAllBtnText}>Move All</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <View style={styles.body}>
        <Animated.View entering={FadeInUp.delay(180).springify()} style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
          <TextInput
            placeholder="Search wishlist"
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.tomato} />
            </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.ScrollView
          entering={FadeInUp.delay(240).springify()}
          horizontal
          style={{maxHeight:65}}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => {
            const active = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, active && styles.activeFilterChip]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[styles.filterChipText, active && styles.activeFilterChipText]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved Products</Text>
          <TouchableOpacity onPress={clearWishlist}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {filteredWishlist.length === 0 ? (
          <Animated.View entering={FadeInDown.springify()} style={styles.emptyState}>
            <LinearGradient
              colors={[COLORS.tomatoSoft, COLORS.skySoft]}
              style={styles.emptyIconWrap}
            >
              <Ionicons name="heart-dislike-outline" size={40} color={COLORS.tomato} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Your wishlist is looking empty</Text>
            <Text style={styles.emptyText}>
              Save your favorite products here so you can find them quickly later.
            </Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.back()}>
              <Text style={styles.shopNowBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.FlatList
            data={filteredWishlist}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={{flex:1}}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
              <WishlistItem
                item={item}
                index={index}
                onRemove={removeItem}
                onAddToCart={addToCart}
                onOpen={openProduct}
              />
            )}
          />
        )}
      </View>
      <StatusBar barStyle="auto"/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  countBadge: {
    position: "absolute",
    top: -4,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    color: COLORS.tomato,
    fontSize: 10,
    fontWeight: "800",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
  },
  headerSubTitle: {
    color: COLORS.white,
    opacity: 0.95,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  summaryCard: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: COLORS.sky,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.skySoft,
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.tomatoSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  summaryValue: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },
  moveAllBtn: {
    backgroundColor: COLORS.sky,
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  moveAllBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBox: {
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.textDark,
    fontSize: 14,
  },
  filterRow: {
    gap: 10,
    paddingTop: 16,
    paddingBottom: 10,
  },
  filterChip: {
  height: 40,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterChip: {
    backgroundColor: COLORS.tomato,
    borderColor: COLORS.tomato,
  },
  filterChipText: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: "700",
  },
  activeFilterChipText: {
    color: COLORS.white,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: 18,
    fontWeight: "900",
  },
  clearAllText: {
    color: COLORS.tomato,
    fontSize: 13,
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: "24%",
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 14,
  },
  imageWrap: {
    width: 118,
    height: 170,
    position: "relative",
    backgroundColor: COLORS.skySoft,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: COLORS.tomato,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 11,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryBadge: {
    backgroundColor: COLORS.skySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  categoryBadgeText: {
    color: COLORS.sky,
    fontSize: 11,
    fontWeight: "800",
  },
  heartBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.tomatoSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 10,
    lineHeight: 22,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  ratingText: {
    marginLeft: 4,
    color: COLORS.textDark,
    fontSize: 12,
    fontWeight: "700",
  },
  stockText: {
    marginLeft: 6,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  priceRow: {
    marginTop: 12,
  },
  price: {
    color: COLORS.tomato,
    fontSize: 18,
    fontWeight: "900",
  },
  oldPrice: {
    color: COLORS.textMuted,
    fontSize: 12,
    textDecorationLine: "line-through",
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  removeBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.tomatoSoft,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  removeBtnText: {
    color: COLORS.tomato,
    fontWeight: "800",
    fontSize: 13,
  },
  cartBtn: {
    flex: 1.2,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.sky,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  cartBtnText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 13,
  },
  swipeActions: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
    marginBottom: 14,
  },
  swipeDeleteBtn: {
    width: 92,
    height: 170,
    borderRadius: 24,
    backgroundColor: COLORS.tomato,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeDeleteText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 13,
    marginTop: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: "26%",
  },
  emptyIconWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
  },
  shopNowBtn: {
    marginTop: 22,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: COLORS.tomato,
    alignItems: "center",
    justifyContent: "center",
  },
  shopNowBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
  },
});

export default WishlistPage;
