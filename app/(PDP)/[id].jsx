import Loader from "@/utils/Loader";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePaystack } from "react-native-paystack-webview";
import {
  useGetSimilarcateQuery,
  useGetSingleEcomQuery,
} from "@/Features/api/EcomerceSlice";
import { uri } from "@/Features/api/Uri";

const { width } = Dimensions.get("window");

const PAYSTACK_PUBLIC_KEY = "pk_test_162884f06e28545f737d29fe112e0fd09da43cac";

const YsStorePDP = () => {
  const params = useLocalSearchParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [expandedSection, setExpandedSection] = useState("desc");
  const [refreshing, setRefreshing] = useState(false);
  const [timer, setTimer] = useState(2 * 60 * 60 + 14 * 60 + 39);

  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: "Amina K.",
      rating: 5,
      date: "2 days ago",
      comment: "Great product, fast delivery!",
      avatar: "https://i.pravatar.cc/150?u=amina",
    },
  ]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(5);

  const { popup } = usePaystack();

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetSingleEcomQuery(
    { id },
    {
      skip: !id,
      pollingInterval: 10000,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    }
  );

  const relatedQueryValue = data?.category || data?.name || "";

  const {
    data: similarData,
    isLoading: loadingSimilar,
    isFetching: fetchingSimilar,
    refetch: refetchSimilar,
  } = useGetSimilarcateQuery(
    { category: data?.category || "", name: data?.name || "" },
    {
      skip: !relatedQueryValue,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    }
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setQuantity(1);
    setActiveSlide(0);
  }, [id]);

  const productImages = useMemo(() => {
    return Array.isArray(data?.img) ? data.img.filter(Boolean) : [];
  }, [data?.img]);

  const currentPrice = Number(data?.soldAtPrice || 0);
  const stock = Number(data?.stock || 0);
  const oldPrice =
    Number(data?.actualPrice || 0) > currentPrice
      ? Number(data?.actualPrice)
      : Math.round(currentPrice * 1.2);

  const discountPercent =
    oldPrice > currentPrice && oldPrice > 0
      ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
      : 0;

  const relatedProducts = useMemo(() => {
    const list = data?.filteredByCate ;
    if (!Array.isArray(list)) return [];
    return list.filter((p) => String(p?._id) !== String(id)).slice(0, 10);
  }, [similarData, id]);

  const totalAmount = currentPrice * quantity;

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")} : ${m
      .toString()
      .padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
  };

  const handleScroll = (event) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slide !== activeSlide) {
      setActiveSlide(slide);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([refetch(), refetchSimilar()]);
    } catch (err) {
      console.log("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const increaseQty = () => {
    if (stock > 0 && quantity < stock) {
      setQuantity((prev) => prev + 1);
    } else if (stock > 0) {
      Alert.alert("Stock limit", `Only ${stock} item(s) available.`);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleShare = async () => {
    if (!data) return;

    const shareUrl = `https://ysstoreapp.com/product/${id}`;

    try {
      await Share.share({
        message: `Check out this ${data?.name} on YsStore for just ₦${Number(
          data?.soldAtPrice || 0
        ).toLocaleString()}.\n\nView product: ${shareUrl}`,
      });
    } catch (err) {
      Alert.alert("Error", "Could not share this product.");
    }
  };

  const handleBuyNow = () => {
    if (!data) {
      Alert.alert("Unavailable", "Product details are not ready yet.");
      return;
    }

    if (stock < 1) {
      Alert.alert("Out of Stock", "This product is currently unavailable.");
      return;
    }

    popup.checkout({
      email: "customer@email.com",
      amount: totalAmount * 100,
      currency: "NGN",
      metadata: {
        productId: id,
        productName: data?.name,
        quantity,
      },
      onSuccess: (res) => {
        Alert.alert(
          "Payment Successful",
          `Reference: ${res?.reference || "Completed"}`
        );
      },
      onCancel: () => {
        Alert.alert("Payment Cancelled");
      },
    });
  };

  const handleAddToCart = () => {
    if (!data) return;

    if (stock < 1) {
      Alert.alert("Out of Stock", "This product is currently unavailable.");
      return;
    }

    Alert.alert(
      "Added to Cart",
      `${quantity} x ${data?.name} added to cart successfully.`
    );

    // Replace this section with your real cart logic or mutation.
    // Example:
    // dispatch(addToCart({
    //   _id: data._id,
    //   name: data.name,
    //   img: data.img?.[0],
    //   soldAtPrice: data.soldAtPrice,
    //   quantity,
    //   companyId: data.companyId,
    // }));
  };

  const handleStorePress = () => {
    // if (data?.companyId) {
      router.push({
        pathname: "/(shop)/Shop",
        params: { id: data?.companyId||data?.branchId},
      });
      // return;
    // }
  };

  const handleChatPress = () => {
    router.push(`../chart/storecharts/2`);
    if (data?.companyId) {
      Alert.alert(
        "Chat",
        "Connect this button to your vendor chat or support screen."
      );
      return;
    }

    Alert.alert("Chat", "Chat is not available for this product yet.");
  };

  const toggleFollow = () => {
    setIsFollowing((prev) => !prev);
    Alert.alert(
      isFollowing ? "Unfollowed" : "Following",
      isFollowing
        ? "You unfollowed this store."
        : "You are now following this store."
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      Alert.alert("Empty Comment", "Please write something before posting.");
      return;
    }

    const commentObj = {
      id: Date.now(),
      user: "Guest User",
      rating: userRating,
      date: "Just now",
      comment: newComment.trim(),
      avatar: "https://i.pravatar.cc/150?u=guest",
    };

    setReviews((prev) => [commentObj, ...prev]);
    setNewComment("");
    setUserRating(5);
    setExpandedSection("reviews");
  };

  if (isLoading && !data) {
    return (
      <View style={styles.centerLoading}>
        <Loader />
      </View>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Ionicons name="alert-circle-outline" size={50} color="#FF4747" />
        <Text style={styles.errorTitle}>Failed to load product</Text>
        <Text style={styles.errorText}>
          Please check your connection and try again.
        </Text>

        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* {(isFetching || fetchingSimilar) && <Loader />} */}

        {/* IMAGE GALLERY */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {productImages.length > 0 ? (
              productImages.map((img, i) => (
                <Image
                  key={`${img}-${i}`}
                  source={{ uri: `${uri}/img/${img}` }}
                  style={styles.galleryImg}
                />
              ))
            ) : (
              <View style={[styles.galleryImg, styles.placeholderImg]}>
                <Ionicons name="image-outline" size={50} color="#CCC" />
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.floatingBack}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.floatingShare} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#FFF" />
          </TouchableOpacity>

          {productImages.length > 0 && (
            <View style={styles.imageCounter}>
              <Text style={styles.counterText}>
                {activeSlide + 1}/{productImages.length}
              </Text>
            </View>
          )}
        </View>

        {/* PRICE + TITLE */}
        <View style={styles.infoSection}>
          <View style={styles.priceRow}>
            <Text style={styles.currencySymbol}>₦</Text>
            <Text style={styles.currentPrice}>
              {currentPrice.toLocaleString()}
            </Text>

            {discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercent}%</Text>
              </View>
            )}
          </View>

          <Text style={styles.oldPrice}>₦{oldPrice.toLocaleString()}</Text>

          <Text style={styles.title} selectable>
            {data?.name || "Unnamed Product"}
          </Text>

          <View style={styles.ratingRow}>
            <View style={styles.inlineRow}>
              <Ionicons name="star" size={14} color="#FF4747" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>

            <Text style={styles.reviewCount}>| {reviews.length} Reviews |</Text>
            <Text style={styles.soldText}>10k+ sold</Text>

            <TouchableOpacity
              style={{ marginLeft: "auto" }}
              onPress={() => setIsLiked((prev) => !prev)}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#FF4747" : "#888"}
              />
            </TouchableOpacity>
          </View>

          {/* Quantity / stock / flash */}
          <View style={styles.metaBox}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Stock</Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: stock > 0 ? "#27AE60" : "#FF4747" },
                ]}
              >
                {stock > 0 ? `${stock} available` : "Out of stock"}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Flash Sale</Text>
              <Text style={styles.metaValue}>{formatTime(timer)}</Text>
            </View>

            <View style={styles.qtyRow}>
              <Text style={styles.metaLabel}>Quantity</Text>

              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={decreaseQty}
                  disabled={quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={18}
                    color={quantity <= 1 ? "#BBB" : "#111"}
                  />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={increaseQty}
                  disabled={stock < 1}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={stock < 1 ? "#BBB" : "#111"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Subtotal</Text>
              <Text style={styles.totalPrice}>₦{totalAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* SHIPPING */}
        <View style={styles.logisticsSection}>
          <View style={styles.logisticsRow}>
            <Text style={styles.logisticsLabel}>Shipping</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.freeShippingText}>Free Shipping</Text>
              <Text style={styles.deliveryEstimate}>
                Estimated delivery: 3 - 5 days
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#AAA" />
          </View>

          <View style={styles.logisticsDivider} />

          <View style={styles.logisticsRow}>
            <Text style={styles.logisticsLabel}>Service</Text>
            <View style={styles.inlineRow}>
              <MaterialCommunityIcons
                name="shield-check"
                size={16}
                color="#FF4747"
              />
              <Text style={styles.serviceText}>7-day Buyer Protection</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#AAA" />
          </View>
        </View>

        <View style={styles.divider} />

        {/* SHOP CARD */}
        <View style={styles.shopCard}>
          <View style={styles.shopHeader}>
            <View style={styles.shopAvatar}>
              <Text style={styles.shopAvatarText}>
                {data?.CompanyName?.charAt(0)?.toUpperCase() || "S"}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.shopName}>
                {data?.CompanyName || "Official Store"}
              </Text>

              <View style={styles.inlineRow}>
                <Ionicons name="medal" size={14} color="#FFB800" />
                <Text style={styles.shopMeta}>Top Brand</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.followBtn} onPress={toggleFollow}>
              <Text style={styles.followBtnText}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* DESCRIPTION */}
        <Accordion
          title="Item Description"
          isOpen={expandedSection === "desc"}
          onPress={() =>
            setExpandedSection(expandedSection === "desc" ? "" : "desc")
          }
        >
          <Text style={styles.descText}>
            {data?.description || "No description provided."}
          </Text>

          <View style={styles.detailBox}>
            <Text style={styles.detailText}>
              Category:{" "}
              <Text style={styles.detailValue}>
                {data?.category || "Not specified"}
              </Text>
            </Text>

            <Text style={styles.detailText}>
              Stock Available:{" "}
              <Text
                style={{
                  fontWeight: "bold",
                  color: stock > 0 ? "#27AE60" : "#FF4747",
                }}
              >
                {stock}
              </Text>
            </Text>
          </View>
        </Accordion>

        {/* REVIEWS */}
        <Accordion
          title={`Reviews (${reviews.length})`}
          isOpen={expandedSection === "reviews"}
          onPress={() =>
            setExpandedSection(expandedSection === "reviews" ? "" : "reviews")
          }
        >
          <View style={styles.addCommentContainer}>
            <Text style={styles.commentLabel}>Leave a Review</Text>

            <View style={styles.starRatingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <Ionicons
                    name={star <= userRating ? "star" : "star-outline"}
                    size={28}
                    color="#FFB800"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Tell others what you think..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />

            <TouchableOpacity
              style={styles.submitCommentBtn}
              onPress={handleAddComment}
            >
              <Text style={styles.submitCommentText}>Post Review</Text>
            </TouchableOpacity>
          </View>

          {reviews.map((rev) => (
            <View key={rev.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Image source={{ uri: rev.avatar }} style={styles.avatar} />

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.reviewerName}>{rev.user}</Text>
                  <View style={{ flexDirection: "row" }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Ionicons key={i} name="star" size={12} color="#FFB800" />
                    ))}
                  </View>
                </View>

                <Text style={styles.reviewDate}>{rev.date}</Text>
              </View>

              <Text style={styles.reviewBody}>{rev.comment}</Text>
            </View>
          ))}
        </Accordion>

        {/* RELATED PRODUCTS */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related Products</Text>

          {isLoading ? (
            <ActivityIndicator
              size="small"
              color="#FF4747"
              style={{ marginVertical: 20 }}
            />
          ) : relatedProducts.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScrollContent}
            >
              {relatedProducts.map((prod) => (
                <TouchableOpacity
                  key={prod?._id}
                  style={styles.relatedCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({
                      pathname: "/app/(PDP)/[id]",
                      params: { id: prod?._id, companyid: prod?.companyId },
                    })
                  }
                >
                  <Image
                    source={{ uri: `${uri}/img/${prod?.img?.[0]}` }}
                    style={styles.relatedImg}
                  />

                  <Text style={styles.relatedProductTitle} numberOfLines={2}>
                    {prod?.name}
                  </Text>

                  <Text style={styles.relatedPrice}>
                    ₦{Number(prod?.soldAtPrice || 0).toLocaleString()}
                  </Text>

                  <TouchableOpacity
                    style={styles.relatedCartBtn}
                    onPress={() =>
                      Alert.alert("Added to Cart", `${prod?.name} added to cart`)
                    }
                  >
                    <Ionicons name="cart" size={16} color="#FFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noRelatedText}>No related products found.</Text>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomIconBtn} onPress={handleStorePress}>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={22}
            color="#333"
          />
          <Text style={styles.bottomIconText}>Store</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomIconBtn} onPress={handleChatPress}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#333" />
          <Text style={styles.bottomIconText}>Chat</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
            <Text style={styles.cartBtnText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buyBtn, stock < 1 && styles.disabledBtn]}
            onPress={handleBuyNow}
            disabled={stock < 1}
          >
            <Text style={styles.buyBtnText}>
              {stock < 1 ? "Out of Stock" : "Buy Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const Accordion = ({ title, isOpen, onPress, children }) => {
  return (
    <View style={styles.accContainer}>
      <TouchableOpacity
        style={styles.accHeader}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.accTitle}>{title}</Text>
        <Ionicons
          name={isOpen ? "chevron-down" : "chevron-forward"}
          size={20}
          color="#AAA"
        />
      </TouchableOpacity>

      {isOpen && <View style={styles.accBody}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 24,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginTop: 14,
  },

  errorText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },

  retryBtn: {
    backgroundColor: "#FF4747",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },

  retryBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },

  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  galleryContainer: {
    width,
    height: width,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },

  galleryImg: {
    width,
    height: width,
    resizeMode: "cover",
  },

  placeholderImg: {
    justifyContent: "center",
    alignItems: "center",
  },

  floatingBack: {
    position: "absolute",
    top: 40,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  floatingShare: {
    position: "absolute",
    top: 40,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  imageCounter: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  counterText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },

  infoSection: {
    padding: 16,
    backgroundColor: "#FFF",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },

  currencySymbol: {
    color: "#FF4747",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
    marginRight: 2,
  },

  currentPrice: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FF4747",
  },

  discountBadge: {
    backgroundColor: "#FFEDED",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
    alignSelf: "center",
  },

  discountText: {
    color: "#FF4747",
    fontSize: 12,
    fontWeight: "700",
  },

  oldPrice: {
    fontSize: 14,
    textDecorationLine: "line-through",
    color: "#999",
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    lineHeight: 22,
    marginBottom: 12,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  ratingText: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#333",
  },

  reviewCount: {
    color: "#888",
    fontSize: 13,
    marginHorizontal: 8,
  },

  soldText: {
    color: "#888",
    fontSize: 13,
  },

  metaBox: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  metaLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },

  metaValue: {
    fontSize: 13,
    color: "#111",
    fontWeight: "700",
  },

  qtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 20,
    overflow: "hidden",
  },

  qtyBtn: {
    width: 38,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },

  qtyText: {
    minWidth: 36,
    textAlign: "center",
    fontWeight: "700",
    color: "#111",
    fontSize: 14,
  },

  totalPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FF4747",
  },

  divider: {
    height: 8,
    backgroundColor: "#F4F4F4",
  },

  logisticsSection: {
    padding: 16,
    backgroundColor: "#FFF",
  },

  logisticsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  logisticsLabel: {
    width: 70,
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
  },

  freeShippingText: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 14,
    marginBottom: 2,
  },

  deliveryEstimate: {
    color: "#555",
    fontSize: 13,
  },

  serviceText: {
    color: "#555",
    fontSize: 13,
  },

  logisticsDivider: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 12,
    paddingTop: 12,
  },

  shopCard: {
    padding: 16,
    backgroundColor: "#FFF",
  },

  shopHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  shopAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FF4747",
    alignItems: "center",
    justifyContent: "center",
  },

  shopAvatarText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  shopName: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 2,
    color: "#111",
  },

  shopMeta: {
    fontSize: 12,
    color: "#FFB800",
    fontWeight: "600",
  },

  followBtn: {
    borderWidth: 1,
    borderColor: "#FF4747",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },

  followBtnText: {
    color: "#FF4747",
    fontWeight: "600",
    fontSize: 13,
  },

  accContainer: {
    backgroundColor: "#FFF",
  },

  accHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },

  accTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111",
  },

  accBody: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  descText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#444",
  },

  detailBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
  },

  detailText: {
    color: "#555",
    fontSize: 13,
    marginBottom: 4,
  },

  detailValue: {
    fontWeight: "bold",
    color: "#000",
  },

  addCommentContainer: {
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  commentLabel: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 10,
  },

  starRatingSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },

  commentInput: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },

  submitCommentBtn: {
    backgroundColor: "#FF4747",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },

  submitCommentText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },

  reviewItem: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 15,
  },

  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  reviewerName: {
    fontWeight: "600",
    fontSize: 13,
    color: "#333",
    marginBottom: 2,
  },

  reviewDate: {
    fontSize: 11,
    color: "#999",
    marginLeft: "auto",
  },

  reviewBody: {
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
  },

  relatedSection: {
    backgroundColor: "#FFF",
    paddingTop: 18,
    paddingBottom: 18,
  },

  relatedTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 16,
    marginBottom: 12,
    color: "#111",
  },

  relatedScrollContent: {
    paddingHorizontal: 10,
  },

  relatedCard: {
    width: 155,
    marginRight: 14,
    backgroundColor: "#FFF",
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    padding: 10,
    position: "relative",
  },

  relatedImg: {
    width: "100%",
    height: 125,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: "cover",
    backgroundColor: "#F4F4F4",
  },

  relatedProductTitle: {
    fontWeight: "600",
    fontSize: 13,
    color: "#222",
    minHeight: 34,
    marginBottom: 4,
  },

  relatedPrice: {
    color: "#FF4747",
    fontWeight: "bold",
    fontSize: 14,
  },

  relatedCartBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#FF4747",
    borderRadius: 16,
    padding: 7,
  },

  noRelatedText: {
    color: "#888",
    marginHorizontal: 16,
    marginTop: 8,
    fontSize: 13,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 24,
    alignItems: "center",
  },

  bottomIconBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
  },

  bottomIconText: {
    fontSize: 10,
    color: "#555",
    marginTop: 2,
  },

  actionButtons: {
    flex: 1,
    flexDirection: "row",
    marginLeft: 10,
    gap: 8,
  },

  cartBtn: {
    flex: 1,
    backgroundColor: "#FF9900",
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  cartBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },

  buyBtn: {
    flex: 1,
    backgroundColor: "#FF4747",
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledBtn: {
    backgroundColor: "#CCC",
  },

  buyBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default YsStorePDP;