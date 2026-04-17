import { useGetShopsQuery } from "@/Features/api/EcomerceSlice";
import { uri } from "@/Features/api/Uri";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");

const FALLBACK_COMPANY_BANNER =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80";

const FALLBACK_BRANCH_BANNER =
  "https://images.unsplash.com/photo-1531297461136-82088df6e124?auto=format&fit=crop&w=800&q=80";

const FALLBACK_LOGO =
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=100&q=80";

const getAddressText = (address) => {
  if (!address) return "Nigeria";

  if (typeof address === "string") return address;

  const values = [
    address?.address,
    address?.StreetName,
    address?.street,
    address?.city,
    address?.lga,
    address?.state,
    address?.country,
  ].filter(Boolean);

  return values.length ? values.join(", ") : "Nigeria";
};

const buildImageUrl = (fileName, fallback) => {
  if (!fileName || typeof fileName !== "string") return fallback;

  if (
    fileName.startsWith("http://") ||
    fileName.startsWith("https://") ||
    fileName.startsWith("file://")
  ) {
    return fileName;
  }

  return `${uri}/img/${fileName}`;
};

export default function ShopListPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isGridView, setIsGridView] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: shopsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetShopsQuery("", {
    pollingInterval: 10000,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
    refetchOnFocus: true,
  });

  const transformedShops = useMemo(() => {
    if (!shopsData?.companies && !shopsData?.branches) return [];

    const shops = [];

    if (Array.isArray(shopsData?.companies)) {
      shopsData.companies.forEach((company) => {
        const settings = company?.settings || {};
        const name =
          settings?.businessName ||
          company?.CompanyName ||
          `Company ${company?.slug || ""}`.trim();

        shops.push({
          id: String(company?._id),
          name,
          type: "Company",
          rating: company?.isSubscribed ? 4.8 : 4.4,
          products:
            (company?.EcomerceProducts?.length || 0) +
            (company?.POSProductsId?.length || 0),
          location: getAddressText(settings?.address || company?.Address),
          description: `${name} - Quality products and services.`,
          banner: buildImageUrl(
            settings?.slug || settings?.banner || settings?.companyBanner,
            FALLBACK_COMPANY_BANNER
          ),
          logo: buildImageUrl(
            settings?.companyLogo || settings?.logo,
            FALLBACK_LOGO
          ),
          isVerified:
            company?.subscriptionStatus === "active" || !!company?.isSubscribed,
          raw: company,
        });
      });
    }

    if (Array.isArray(shopsData?.branches)) {
      shopsData.branches.forEach((branch) => {
        const settings = branch?.settings || {};
        const name =
          settings?.businessName || branch?.CompanyName || branch?.slug || "Branch";

        shops.push({
          id: String(branch?._id),
          name,
          type: "Branch",
          rating: 4.3,
          products:
            (branch?.EcomerceProducts?.length || 0) +
            (branch?.POSProductsId?.length || 0),
          location: getAddressText(settings?.address || branch?.Address),
          description: `${name} - Explore our products and services.`,
          banner: buildImageUrl(
            settings?.slug || settings?.banner || settings?.companyBanner,
            FALLBACK_BRANCH_BANNER
          ),
          logo: buildImageUrl(
            settings?.companyLogo || settings?.logo,
            FALLBACK_LOGO
          ),
          isVerified: !!branch?.companyId,
          raw: branch,
        });
      });
    }

    return shops;
  }, [shopsData]);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transformedShops.filter((shop) => {
      const matchesSearch =
        !query ||
        shop?.name?.toLowerCase().includes(query) ||
        shop?.location?.toLowerCase().includes(query) ||
        shop?.description?.toLowerCase().includes(query);

      const matchesType = filterType === "All" ? true : shop.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [transformedShops, search, filterType]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (err) {
      console.log("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const toggleLayout = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setIsGridView((prev) => !prev);
  }, []);

  const handleFilterChange = useCallback((type) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilterType(type);
  }, []);

  const handleOpenShop = useCallback((item) => {
    router.push   ({
      pathname: "(shop)/Shop",
      params: {
        id: item?.raw?.settings?.companyId||item?.raw?.settings?.branchId,
        shopType: item.type,
        shopName: item.name,
      },
    });
  }, []);

  const renderShopCard = ({ item, index }) => {
    if (isGridView) {
      const isLastInRow = index % 2 !== 0;

      return (
        <TouchableOpacity
          onPress={() => handleOpenShop(item)}
          style={[styles.gridCard, { marginRight: isLastInRow ? 0 : 16 }]}
          activeOpacity={0.92}
        >
          <Image source={{ uri: item.banner }} style={styles.gridBanner} />

          <View style={styles.gridTypePill}>
            <Text style={styles.gridTypeText}>{item.type}</Text>
          </View>

          <View style={styles.gridInfo}>
            <Image source={{ uri: item.logo }} style={styles.gridLogo} />

            <Text style={styles.gridName} numberOfLines={1}>
              {item.name}
            </Text>

            <View style={styles.ratingRow}>
              <FontAwesome name="star" size={11} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>

            <Text style={styles.gridLocation} numberOfLines={1}>
              {item.location}
            </Text>

            <Text style={styles.gridProducts} numberOfLines={1}>
              {item.products} Products
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => handleOpenShop(item)}
        style={styles.card}
        activeOpacity={0.92}
      >
        <Image source={{ uri: item.banner }} style={styles.banner} />

        <View
          style={[
            styles.typeTag,
            {
              backgroundColor: item.type === "Company" ? "#0F172A" : "#FF6347",
            },
          ]}
        >
          <Text style={styles.typeTagText}>{item.type}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.logoContainer}>
            <Image source={{ uri: item.logo }} style={styles.logo} />
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.shopName} numberOfLines={1}>
                {item.name}
              </Text>

              {item.isVerified && (
                <MaterialIcons
                  name="verified"
                  size={16}
                  color="#38BDF8"
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>

            <View style={styles.ratingRow}>
              <FontAwesome name="star" size={13} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>

              <MaterialIcons
                name="location-on"
                size={14}
                color="#64748B"
                style={{ marginLeft: 10 }}
              />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.footerRow}>
              <View style={styles.productBadge}>
                <Ionicons name="bag-handle-outline" size={14} color="#64748B" />
                <Text style={styles.productText}>{item.products} Products</Text>
              </View>

              <TouchableOpacity
                style={styles.visitButton}
                onPress={() => handleOpenShop(item)}
              >
                <Text style={styles.visitButtonText}>Visit Shop</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        Discover <Text style={{ color: "#FF6347" }}>Partner Shops</Text>
      </Text>

      <Text style={styles.subTitle}>
        Browse verified companies and branches directly from YsStore
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{filteredData.length}</Text>
          <Text style={styles.statLabel}>Showing</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {(shopsData?.totalCompanies || 0) + (shopsData?.totalBranches || 0)}
          </Text>
          <Text style={styles.statLabel}>Total Shops</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies or shops..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity style={styles.layoutToggle} onPress={toggleLayout}>
          <Ionicons
            name={isGridView ? "list-outline" : "grid-outline"}
            size={24}
            color="#0F172A"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {["All", "Company", "Branch"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              filterType === tab && styles.tabButtonActive,
            ]}
            onPress={() => handleFilterChange(tab)}
          >
            <Text
              style={[
                styles.tabText,
                filterType === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (isLoading && !shopsData) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Loading shops...</Text>
      </SafeAreaView>
    );
  }

  if (error && !transformedShops.length) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <MaterialIcons name="error-outline" size={40} color="#FF6347" />
        <Text style={styles.errorTitle}>Failed to load shops</Text>
        <Text style={styles.errorText}>
          Please check your connection and try again.
        </Text>

        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredData}
        renderItem={renderShopCard}
        keyExtractor={(item) => item.id}
        numColumns={isGridView ? 2 : 1}
        key={isGridView ? "GRID" : "LIST"}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listPadding}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || (isFetching && !isLoading)}
            onRefresh={onRefresh}
            tintColor="#FF6347"
            colors={["#FF6347", "#38BDF8"]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Shops Found</Text>
            <Text style={styles.emptyText}>
              We couldn't find any companies matching your search.
            </Text>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearch("");
                setFilterType("All");
              }}
            >
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#64748B",
    fontWeight: "600",
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 18,
    color: "#0F172A",
    fontWeight: "800",
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: "#FF6347",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retryText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 14,
  },

  header: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
  },

  subTitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 20,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },

  statValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },

  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "600",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 52,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#0F172A",
  },

  layoutToggle: {
    marginLeft: 12,
    width: 52,
    height: 52,
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 4,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
    borderRadius: 10,
  },

  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  tabText: {
    color: "#94A3B8",
    fontWeight: "700",
    fontSize: 14,
  },

  tabTextActive: {
    color: "#0F172A",
  },

  listPadding: {
    paddingBottom: 100,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginHorizontal: 16,
    marginBottom: 18,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },

  banner: {
    width: "100%",
    height: 150,
  },

  typeTag: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  typeTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFF",
    textTransform: "uppercase",
  },

  cardContent: {
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  logoContainer: {
    marginTop: -55,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    elevation: 4,
  },

  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  shopName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },

  ratingText: {
    fontSize: 13,
    color: "#1E293B",
    marginLeft: 4,
    fontWeight: "700",
  },

  locationText: {
    flex: 1,
    fontSize: 13,
    color: "#64748B",
    marginLeft: 4,
  },

  description: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginTop: 2,
  },

  footerRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productBadge: {
    flexDirection: "row",
    alignItems: "center",
  },

  productText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
  },

  visitButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 4,
  },

  visitButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },

  gridCard: {
    width: (width - 48) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 16,
    marginLeft: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  gridBanner: {
    width: "100%",
    height: 100,
  },

  gridTypePill: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(15,23,42,0.88)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  gridTypeText: {
    fontSize: 9,
    color: "#FFFFFF",
    fontWeight: "800",
    textTransform: "uppercase",
  },

  gridInfo: {
    padding: 10,
    alignItems: "center",
  },

  gridLogo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginTop: -30,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },

  gridName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 5,
  },

  gridLocation: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },

  gridProducts: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
    fontWeight: "700",
  },

  emptyWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800",
    color: "#334155",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },

  clearButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FF6347",
    borderRadius: 10,
  },

  clearButtonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 13,
  },
});