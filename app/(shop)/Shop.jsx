import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  StatusBar,
  TextInput,
  Dimensions,
  Alert,
  RefreshControl,
  Share,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useGetSingleShopsQuery } from "@/Features/api/EcomerceSlice";
import { uri } from "@/Features/api/Uri";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 58;

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
  warning: "#F59E0B",
};

const FALLBACK_STORE_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80";

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop";

const normalizeImageUri = (value) => {
  if (!value) return FALLBACK_PRODUCT_IMAGE;
  if (typeof value === "string") {
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return `${uri}/img/${value}`;
  }
  if (typeof value === "object") {
    const possible =
      value?.url ||
      value?.uri ||
      value?.path ||
      value?.filename ||
      value?.name ||
      value?.public_id;
    if (possible) {
      if (
        typeof possible === "string" &&
        (possible.startsWith("http://") || possible.startsWith("https://"))
      ) {
        return possible;
      }
      return `${uri}/img/${possible}`;
    }
  }
  return FALLBACK_PRODUCT_IMAGE;
};

const getProductImage = (product) => {
  if (!product) return FALLBACK_PRODUCT_IMAGE;

  if (Array.isArray(product?.img) && product.img.length > 0) {
    return normalizeImageUri(product.img[0]);
  }

  if (product?.img) {
    return normalizeImageUri(product.img);
  }

  return FALLBACK_PRODUCT_IMAGE;
};

const buildBanners = (shopData) => {
  const banners = [];
  const logo = shopData?.settings?.companyLogo;
  const slugImage = shopData?.settings?.slug;

  if (logo) {
    banners.push({
      id: "logo-banner",
      image: normalizeImageUri(logo),
      title: shopData?.settings?.businessName || shopData?.CompanyName || "Store",
      subtitle: "Trusted products from this store",
    });
  }

  if (slugImage) {
    banners.push({
      id: "slug-banner",
      image: normalizeImageUri(slugImage),
      title: "Shop Collection",
      subtitle: "Browse the latest items from this seller",
    });
  }

  const products = shopData?.EcomerceProducts || [];
  products.slice(0, 3).forEach((item, index) => {
    banners.push({
      id: `product-banner-${item?._id || index}`,
      image: getProductImage(item),
      title: item?.name || "Featured Product",
      subtitle: item?.description || item?.categoryName || "Available now",
    });
  });

  if (banners.length === 0) {
    banners.push({
      id: "fallback-banner",
      image: FALLBACK_STORE_IMAGE,
      title: "Top Deals",
      subtitle: "Best quality products from this store",
    });
  }

  return banners.slice(0, 5);
};

const mapApiProductToUi = (item) => {
  const price = Number(item?.soldAtPrice ?? item?.price ?? 0);
  const oldPriceRaw = Number(item?.actualPrice ?? item?.costPrice ?? 0);
  const oldPrice = oldPriceRaw > price ? oldPriceRaw : price;
  const stock = Number(item?.quantity ?? 0);

  return {
    id: item?._id,
    category: item?.categoryName || "General",
    name: item?.name || "Unnamed Product",
    price,
    oldPrice,
    stock,
    rating: stock > 0 ? 4.8 : 4.2,
    sold: item?.sku ? item.sku : `${stock} in stock`,
    image: getProductImage(item),
    featured: stock > 0,
    favorite: false,
    raw: item,
  };
};

const StorePage = () => {
  const { id } = useLocalSearchParams();
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetSingleShopsQuery(
    { id },
    {
      pollingInterval: 30000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const shopData = data?.data || {};

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [cart, setCart] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const bannerScrollRef = useRef(null);

  useEffect(() => {
    console.log("Getting all data from native", data);
  }, [data]);

  const products = useMemo(() => {
    const incoming = Array.isArray(shopData?.EcomerceProducts)
      ? shopData.EcomerceProducts
      : [];
    return incoming.map(mapApiProductToUi);
  }, [shopData]);

  const categories = useMemo(() => {
    const categoryNames = Array.from(
      new Set(products.map((item) => item.category).filter(Boolean))
    );

    return [
      { id: "all", name: "All", icon: "grid-outline" },
      ...categoryNames.map((name, index) => ({
        id: `${name}-${index}`,
        name,
        icon: "pricetag-outline",
      })),
    ];
  }, [products]);

  const bannerImages = useMemo(() => buildBanners(shopData), [shopData]);

  const featuredProducts = useMemo(() => {
    return products.filter((item) => item.featured);
  }, [products]);

  const favoriteCount = useMemo(() => {
    return products.filter((item) => item.favorite).length;
  }, [products]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== "All") {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          String(item?.raw?.description || "")
            .toLowerCase()
            .includes(q)
      );
    }

    return list;
  }, [selectedCategory, search, products]);

  const totalOrders = Array.isArray(shopData?.Orders) ? shopData.Orders.length : 0;
  const totalBranches = Array.isArray(shopData?.BranchId) ? shopData.BranchId.length : 0;
  const totalProducts = products.length;

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (error) {
      Alert.alert("Refresh Error", error?.message || "Unable to refresh store data.");
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleBannerScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / (BANNER_WIDTH + 14));
    if (index >= 0 && index < bannerImages.length) {
      setActiveBanner(index);
    }
  };

  const scrollToBanner = (index) => {
    bannerScrollRef.current?.scrollTo({
      x: index * (BANNER_WIDTH + 14),
      animated: true,
    });
    setActiveBanner(index);
  };

  const toggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  const toggleFavorite = (productId) => {
    if (!productId) return;
  };

  const addToCart = (product) => {
    if (!product?.id) return;

    if (product.stock < 1) {
      Alert.alert("Out of Stock", "This product is currently unavailable.");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          Alert.alert("Stock Limit", "You cannot add more than available stock.");
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    Alert.alert("Cart Updated", `${product.name} added to cart.`);
  };

  const openProduct = (product) => {
    if (!product?.id) {
      Alert.alert("Unavailable", "Product information is incomplete.");
      return;
    }

    router.push({
      pathname: "/(PDP)/[id]",
      params: { id: product.id },
    });
  };

  const handleSearchSubmit = () => {
    if (!search.trim()) {
      Alert.alert("Search", "Type a product name or category.");
      return;
    }
    Alert.alert("Search Applied", `Showing results for "${search.trim()}".`);
  };

  const handleOpenChat = () => {
    router.push("/app/chat");
  };

  const handleHeaderCart = () => {
    Alert.alert("Cart", `You currently have ${cartCount} item(s) in cart.`);
  };

  const handleHeaderFavorites = () => {
    Alert.alert("Favorites", `You have ${favoriteCount} favorite product(s).`);
  };

  const handleShareStore = async () => {
    try {
      const storeName =
        shopData?.settings?.businessName || shopData?.CompanyName || "this store";
      await Share.share({
        message: `Check out ${storeName} on YsStore.`,
      });
    } catch (err) {
      Alert.alert(
        "Share Error",
        err?.message || "An error occurred while trying to share the store."
      );
    }
  };

  const renderProduct = ({ item }) => {
    const hasDiscount = item.oldPrice > item.price && item.oldPrice > 0;
    const discount = hasDiscount
      ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.92}
        onPress={() => openProduct(item)}
      >
        <View style={styles.productImageWrap}>
          <Image source={{ uri: item.image }} style={styles.productImage} />

          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons
              name={item.favorite ? "heart" : "heart-outline"}
              size={18}
              color={COLORS.tomato}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text numberOfLines={2} style={styles.productName}>
            {item.name}
          </Text>

          <View style={styles.categoryMiniBadge}>
            <Text style={styles.categoryMiniBadgeText}>{item.category}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={COLORS.tomato} />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text numberOfLines={1} style={styles.soldText}>
              • {item.sold}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₦{Number(item.price || 0).toLocaleString()}</Text>
            {hasDiscount && (
              <Text style={styles.oldPrice}>
                ₦{Number(item.oldPrice || 0).toLocaleString()}
              </Text>
            )}
          </View>

          <View style={styles.stockRow}>
            <Text
              style={[
                styles.stockText,
                { color: item.stock > 0 ? COLORS.success : COLORS.warning },
              ]}
            >
              {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
            </Text>

            <TouchableOpacity
              style={[
                styles.cartBtn,
                item.stock < 1 && styles.disabledCartBtn,
              ]}
              onPress={() => addToCart(item)}
              disabled={item.stock < 1}
            >
              <Ionicons name="cart" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.centerLoading}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        <ActivityIndicator size="large" color={COLORS.tomato} />
        <Text style={styles.loadingText}>Loading store...</Text>
      </SafeAreaView>
    );
  }

  const storeName =
    shopData?.settings?.businessName || shopData?.CompanyName || "Store";
  const storeEmail =
    shopData?.CompanyEmail ||
    shopData?.settings?.businessEmail ||
    "No email available";
  const storeLogo = shopData?.settings?.companyLogo
    ? normalizeImageUri(shopData?.settings?.companyLogo)
    : FALLBACK_STORE_IMAGE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tomato} />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item, index) => item?.id || `${index}`}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={filteredProducts.length ? styles.columnWrapper : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={handleRefresh}
          />
        }
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={[COLORS.tomato, COLORS.sky]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.topBar}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                </TouchableOpacity>

                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={handleHeaderFavorites}>
                    <Ionicons name="heart-outline" size={21} color={COLORS.white} />
                    {favoriteCount > 0 && (
                      <View style={styles.headerCountBadge}>
                        <Text style={styles.headerCountText}>{favoriteCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.iconBtn} onPress={handleHeaderCart}>
                    <Ionicons name="cart-outline" size={21} color={COLORS.white} />
                    {cartCount > 0 && (
                      <View style={styles.headerCountBadge}>
                        <Text style={styles.headerCountText}>{cartCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.iconBtn} onPress={handleShareStore}>
                    <Ionicons name="share-social-outline" size={21} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.storeProfileCard}>
                <Image source={{ uri: storeLogo }} style={styles.storeAvatar} />

                <View style={styles.storeContent}>
                  <View style={styles.storeNameRow}>
                    <Text style={styles.storeName}>{storeName}</Text>
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.sky} />
                    </View>
                  </View>

                  <Text style={styles.storeHandle}>{storeEmail}</Text>
                  <Text style={styles.storeDescription}>
                    {shopData?.type === "company"
                      ? "Original products, trusted checkout, and reliable store support."
                      : "Trusted seller with available products and active store listing."}
                  </Text>

                  <View style={styles.storeStatsRow}>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>{totalProducts}</Text>
                      <Text style={styles.statLabel}>Products</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>{totalOrders}</Text>
                      <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>{totalBranches}</Text>
                      <Text style={styles.statLabel}>Branches</Text>
                    </View>
                  </View>

                  <View style={styles.storeActionRow}>
                    <TouchableOpacity
                      style={[styles.followBtn, isFollowing && styles.followingBtn]}
                      onPress={toggleFollow}
                    >
                      <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                        {isFollowing ? "Following" : "Follow Store"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.chatBtn} onPress={handleOpenChat}>
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={18}
                        color={COLORS.tomato}
                      />
                      <Text style={styles.chatBtnText}>Chat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.bodyContent}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                  placeholder="Search products in this store"
                  placeholderTextColor={COLORS.textMuted}
                  value={search}
                  onChangeText={setSearch}
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                  style={styles.searchInput}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={20} color={COLORS.tomato} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                ref={bannerScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bannerScroll}
                onScroll={handleBannerScroll}
                scrollEventThrottle={16}
                snapToInterval={BANNER_WIDTH + 14}
                decelerationRate="fast"
              >
                {bannerImages.map((banner) => (
                  <TouchableOpacity
                    key={banner.id}
                    activeOpacity={0.92}
                    style={styles.bannerCard}
                  >
                    <Image source={{ uri: banner.image }} style={styles.bannerImage} />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.55)"]}
                      style={styles.bannerOverlay}
                    >
                      <Text style={styles.bannerTitle}>{banner.title}</Text>
                      <Text style={styles.bannerSubTitle} numberOfLines={2}>
                        {banner.subtitle}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.bannerDots}>
                {bannerImages.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => scrollToBanner(index)}
                    style={[styles.dot, activeBanner === index && styles.activeDot]}
                  />
                ))}
              </View>

              {featuredProducts.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Product</Text>
                    <TouchableOpacity onPress={() => setSelectedCategory("All")}>
                      <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.featuredCard}
                    activeOpacity={0.92}
                    onPress={() => openProduct(featuredProducts[0])}
                  >
                    <Image
                      source={{ uri: featuredProducts[0].image }}
                      style={styles.featuredImage}
                    />
                    <LinearGradient
                      colors={["rgba(255,99,71,0.08)", "rgba(56,189,248,0.08)"]}
                      style={styles.featuredContent}
                    >
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>Featured</Text>
                      </View>
                      <Text style={styles.featuredTitle}>{featuredProducts[0].name}</Text>
                      <Text style={styles.featuredPrice}>
                        ₦{Number(featuredProducts[0].price || 0).toLocaleString()}
                      </Text>
                      <Text style={styles.featuredSubText}>
                        {featuredProducts[0]?.raw?.description ||
                          "Premium quality with fast delivery and trusted store service."}
                      </Text>
                      <TouchableOpacity
                        style={styles.featuredBtn}
                        onPress={() => addToCart(featuredProducts[0])}
                      >
                        <Text style={styles.featuredBtnText}>Add to Cart</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <TouchableOpacity onPress={() => setSelectedCategory("All")}>
                  <Text style={styles.seeAllText}>Reset</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesRow}
              >
                {categories.map((category) => {
                  const isActive = selectedCategory === category.name;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[styles.categoryChip, isActive && styles.activeCategoryChip]}
                      onPress={() => setSelectedCategory(category.name)}
                    >
                      <Ionicons
                        name={category.icon}
                        size={17}
                        color={isActive ? COLORS.white : COLORS.tomato}
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          isActive && styles.activeCategoryText,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Store Products</Text>
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{filteredProducts.length} items</Text>
                </View>
              </View>
            </View>
          </>
        }
        renderItem={renderProduct}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={44}
              color={COLORS.sky}
            />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>Try another search or category.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centerLoading: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
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
  headerCountBadge: {
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
  headerCountText: {
    color: COLORS.tomato,
    fontSize: 10,
    fontWeight: "800",
  },
  storeProfileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 14,
    shadowColor: COLORS.sky,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.skySoft,
  },
  storeAvatar: {
    width: 82,
    height: 82,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 12,
  },
  storeContent: {
    alignItems: "center",
  },
  storeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
    textAlign: "center",
  },
  verifiedBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  storeHandle: {
    fontSize: 13,
    color: COLORS.sky,
    marginTop: 4,
    fontWeight: "700",
    textAlign: "center",
  },
  storeDescription: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  storeStatsRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    minWidth: 92,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.tomato,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },
  storeActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    width: "100%",
  },
  followBtn: {
    flex: 1,
    backgroundColor: COLORS.tomato,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  followingBtn: {
    backgroundColor: COLORS.tomatoSoft,
  },
  followBtnText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 14,
  },
  followingBtnText: {
    color: COLORS.tomato,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: COLORS.skySoft,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderWidth: 1,
    borderColor: "#CBEFFF",
  },
  chatBtnText: {
    color: COLORS.tomato,
    fontWeight: "800",
    fontSize: 14,
  },
  bodyContent: {
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
  bannerScroll: {
    paddingTop: 18,
    paddingBottom: 8,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 170,
    borderRadius: 22,
    marginRight: 14,
    overflow: "hidden",
    backgroundColor: COLORS.skySoft,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
  },
  bannerSubTitle: {
    color: COLORS.white,
    fontSize: 12,
    marginTop: 4,
    opacity: 0.95,
  },
  bannerDots: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.tomatoSoft,
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.tomato,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  seeAllText: {
    color: COLORS.sky,
    fontWeight: "700",
    fontSize: 13,
  },
  featuredCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featuredImage: {
    width: "100%",
    height: 180,
  },
  featuredContent: {
    padding: 16,
  },
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.tomato,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  featuredBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  featuredPrice: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.tomato,
    marginTop: 8,
  },
  featuredSubText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  featuredBtn: {
    marginTop: 14,
    backgroundColor: COLORS.sky,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredBtnText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 14,
  },
  categoriesRow: {
    gap: 10,
    paddingBottom: 4,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCategoryChip: {
    backgroundColor: COLORS.tomato,
    borderColor: COLORS.tomato,
  },
  categoryText: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: "700",
  },
  activeCategoryText: {
    color: COLORS.white,
  },
  filterBadge: {
    backgroundColor: COLORS.skySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  filterBadgeText: {
    color: COLORS.sky,
    fontSize: 12,
    fontWeight: "800",
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 14,
  },
  productCard: {
    width: (width - 44) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productImageWrap: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 150,
    backgroundColor: COLORS.skySoft,
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
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: "800",
    minHeight: 38,
  },
  categoryMiniBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: COLORS.skySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryMiniBadgeText: {
    color: COLORS.sky,
    fontSize: 11,
    fontWeight: "800",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ratingText: {
    marginLeft: 4,
    color: COLORS.textDark,
    fontWeight: "700",
    fontSize: 12,
  },
  soldText: {
    marginLeft: 6,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  priceRow: {
    marginTop: 10,
  },
  price: {
    color: COLORS.tomato,
    fontWeight: "900",
    fontSize: 16,
  },
  oldPrice: {
    color: COLORS.textMuted,
    textDecorationLine: "line-through",
    fontSize: 12,
    marginTop: 2,
  },
  stockRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  stockText: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  cartBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.sky,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledCartBtn: {
    opacity: 0.45,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textDark,
    marginTop: 10,
  },
  emptyText: {
    color: COLORS.textMuted, 
    fontSize: 13,
    marginTop: 4,
  },
});

export default StorePage;