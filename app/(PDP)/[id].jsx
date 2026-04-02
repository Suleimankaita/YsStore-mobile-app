import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, Image, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions, StatusBar, Alert, ActivityIndicator, TextInput,
  Share
} from 'react-native';
import Loader from "@/utils/Loader"
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePaystack } from 'react-native-paystack-webview';
import { useLocalSearchParams } from 'expo-router';
// Assuming this is your API hook
import { useGetSingleEcomQuery } from '@/Features/api/EcomerceSlice';
import { uri } from '@/Features/api/Uri';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// 🔴 UPDATE THIS: Your server base URL where images are hosted
const IMAGE_BASE_URL = "https://your-api-domain.com/uploads/";

const PAYSTACK_PUBLIC_KEY = "pk_test_162884f06e28545f737d29fe112e0fd09da43cac";

const YsStorePDP = () => {
  const { id } = useLocalSearchParams();
  
  const { data, error, isLoading } = useGetSingleEcomQuery(
    { id },
    {
      pollingInterval: 10000,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    }
  );

  const { popup } = usePaystack();
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [expandedSection, setExpandedSection] = useState('desc');
  const [timer, setTimer] = useState(2 * 60 * 60 + 14 * 60 + 39); // Flash sale timer

  // Reviews State (Using mock initial reviews since the API doesn't provide them yet)
  const [reviews, setReviews] = useState([
    { id: 1, user: "Amina K.", rating: 5, date: "2 days ago", comment: "Great product, fast delivery!", avatar: "https://i.pravatar.cc/150?u=amina" }
  ]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
  };

  const handleScroll = (event) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slide !== activeSlide) setActiveSlide(slide);
  };

  const handleBuyNow = (price) => {
    popup.checkout({
      email: "customer@email.com",
      amount: price * quantity * 100, // kobo
      currency: "NGN",
      onSuccess: (res) => {
        Alert.alert("Payment Successful", res.reference);
      },
      onCancel: () => {
        Alert.alert("Payment Cancelled");
      },
    });
  };

  const handleAddComment = () => {
    if (newComment.trim() === "") {
      Alert.alert("Empty Comment", "Please write something before posting.");
      return;
    }
    const commentObj = {
      id: Date.now(),
      user: "Guest User",
      rating: userRating,
      date: "Just now",
      comment: newComment,
      avatar: "https://i.pravatar.cc/150?u=guest"
    };
    setReviews([commentObj, ...reviews]);
    setNewComment("");
    setUserRating(5);
  };

  // if (isLoading) {
  //   return (
  //     <View style={styles.centerLoading}>
  //       <ActivityIndicator size="large" color="#FF4747" />
  //     </View>
  //   );
  // }

  if (error || !data) {
    return (
      <View style={styles.centerLoading}>
        <Text style={{ color: '#555' }}>Failed to load product details.</Text>
      </View>
    );
  }

  // Map API Data
  const productImages = data.img || [];
  const currentPrice = data.soldAtPrice || 0;
  // Fallback: If your actualPrice is meant to be the "original" slashed price, use it. 
  // Otherwise, calculate a fake original price just for the UI effect.
  const oldPrice = data.actualPrice > currentPrice ? data.actualPrice : currentPrice * 1.2; 
  const discountPercent = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
 const handleShare = async () => {
  if (!data) return;
  
  // This is your "Smart Link"
  const shareUrl = `https://ysstoreapp.com/product/${id}`; 

  try {
    const result = await Share.share({
      message: `Check out this ${data.name} on YsStore for just ₦${data.soldAtPrice.toLocaleString()}!\n\nView product: ${shareUrl}`,
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // Shared with specific activity type
      } else {
        // Shared
      }
    } else if (result.action === Share.dismissedAction) {
      // Dismissed
    }
  } catch (error) {
    Alert.alert("Error", "Could not share this product.");
  }
};
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff00" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {isLoading&&<Loader/>}
        {/* 1. IMAGE GALLERY (AliExpress Style) */}
        <View style={styles.galleryContainer}>
          <ScrollView 
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={handleScroll} scrollEventThrottle={16}
          >
            {productImages.length > 0 ? (
              productImages.map((img, i) => (
                <Image key={i} source={{ uri: `${uri}/img/${img}` }} style={styles.galleryImg} />
              ))
            ) : (
              <View style={[styles.galleryImg, styles.placeholderImg]}>
                <Ionicons name="image-outline" size={50} color="#CCC" />
              </View>
            )}
          </ScrollView>

          {/* AliExpress style floating header buttons */}
          <TouchableOpacity style={styles.floatingBack} onPress={() => {router.back()}}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingShare} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* AliExpress Image Counter */}
          {productImages.length > 0 && (
            <View style={styles.imageCounter}>
              <Text style={styles.counterText}>{activeSlide + 1}/{productImages.length}</Text>
            </View>
          )}
        </View>

        {/* 2. PRICE & TITLE SECTION */}
        <View style={styles.infoSection}>
          <View style={styles.priceRow}>
            <Text style={styles.currencySymbol}>₦</Text>
            <Text style={styles.currentPrice}>{currentPrice.toLocaleString()}</Text>
            {discountPercent > 0 && (
               <View style={styles.discountBadge}>
                 <Text style={styles.discountText}>-{discountPercent}%</Text>
               </View>
            )}
          </View>
          <Text style={styles.oldPrice}>₦{oldPrice.toLocaleString()}</Text>

          <Text style={styles.title} selectable>{data.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Ionicons name="star" size={14} color="#FF4747" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
            <Text style={styles.reviewCount}>|   {reviews.length} Reviews   |</Text>
            <Text style={styles.soldText}>10k+ sold</Text>
            <TouchableOpacity style={{marginLeft: 'auto'}} onPress={() => setIsLiked(!isLiked)}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "#FF4747" : "#888"} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 3. LOGISTICS / SHIPPING INFO */}
        <View style={styles.logisticsSection}>
            <View style={styles.logisticsRow}>
                <Text style={styles.logisticsLabel}>Shipping</Text>
                <View style={{flex: 1}}>
                    <Text style={styles.freeShippingText}>Free Shipping</Text>
                    <Text style={styles.deliveryEstimate}>Estimated delivery: 3-5 days</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#AAA" />
            </View>
            <View style={[styles.logisticsRow, { borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 12, paddingTop: 12 }]}>
                <Text style={styles.logisticsLabel}>Service</Text>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4}}>
                    <MaterialCommunityIcons name="shield-check" size={16} color="#FF4747" />
                    <Text style={styles.serviceText}>7-day Buyer Protection</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#AAA" />
            </View>
        </View>

        <View style={styles.divider} />

        {/* 4. SHOP CARD */}
        <View style={styles.shopCard}>
          <View style={styles.shopHeader}>
             <View style={styles.shopAvatar}>
               <Text style={styles.shopAvatarText}>{data.CompanyName ? data.CompanyName.charAt(0) : 'S'}</Text>
             </View>
             <View style={{flex: 1}}>
                <Text style={styles.shopName}>{data.CompanyName || 'Official Store'}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                  <Ionicons name="medal" size={14} color="#FFB800" />
                  <Text style={styles.shopMeta}>Top Brand</Text>
                </View>
             </View>
             <TouchableOpacity style={styles.followBtn}>
                 <Text style={styles.followBtnText}>Follow</Text>
             </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 5. DESCRIPTION */}
        <Accordion 
          title="Item Description" 
          isOpen={expandedSection === 'desc'} 
          onPress={() => setExpandedSection(expandedSection === 'desc' ? '' : 'desc')}
        >
          <Text style={styles.descText}>{data.description || 'No description provided.'}</Text>
          <View style={{marginTop: 15, padding: 10, backgroundColor: '#F9F9F9', borderRadius: 8}}>
            <Text style={{color: '#555', fontSize: 13, marginBottom: 4}}>Category: <Text style={{fontWeight: 'bold', color: '#000'}}>{data.category}</Text></Text>
            <Text style={{color: '#555', fontSize: 13}}>Stock Available: <Text style={{fontWeight: 'bold', color: data.stock > 0 ? '#27AE60' : '#FF4747'}}>{data.stock}</Text></Text>
          </View>
        </Accordion>

        {/* 6. REVIEWS */}
        <Accordion 
          title={`Reviews (${reviews.length})`}
          isOpen={expandedSection === 'reviews'} 
          onPress={() => setExpandedSection(expandedSection === 'reviews' ? '' : 'reviews')}
        >
          {/* Add Comment Input */}
          <View style={styles.addCommentContainer}>
            <Text style={styles.commentLabel}>Leave a Review</Text>
            <View style={styles.starRatingSelector}>
              {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <Ionicons name={star <= userRating ? "star" : "star-outline"} size={28} color="#FFB800" />
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
            <TouchableOpacity style={styles.submitCommentBtn} onPress={handleAddComment}>
              <Text style={styles.submitCommentText}>Post Review</Text>
            </TouchableOpacity>
          </View>

          {reviews.map((rev) => (
            <View key={rev.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Image source={{ uri: rev.avatar }} style={styles.avatar} />
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={styles.reviewerName}>{rev.user}</Text>
                  <View style={{flexDirection:'row'}}>{[...Array(rev.rating)].map((_,i)=><Ionicons key={i} name="star" size={12} color="#FFB800"/>)}</View>
                </View>
                <Text style={styles.reviewDate}>{rev.date}</Text>
              </View>
              <Text style={styles.reviewBody}>{rev.comment}</Text>
            </View>
          ))}
        </Accordion>

      </ScrollView>

      {/* 7. ALIEXPRESS STYLE BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomIconBtn}>
          <MaterialCommunityIcons name="storefront-outline" size={22} color="#333" />
          <Text style={styles.bottomIconText}>Store</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomIconBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#333" />
          <Text style={styles.bottomIconText}>Chat</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cartBtn} onPress={() => Alert.alert("Added to Cart")}>
            <Text style={styles.cartBtnText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.buyBtn, data.stock < 1 && {backgroundColor: '#CCC'}]} 
            onPress={() => handleBuyNow(currentPrice)}
            disabled={data.stock < 1}
          >
            <Text style={styles.buyBtnText}>{data.stock < 1 ? 'Out of Stock' : 'Buy Now'}</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
};

// --- SUB COMPONENTS ---
const Accordion = ({ title, isOpen, onPress, children }) => (
  <View style={styles.accContainer}>
    <TouchableOpacity style={styles.accHeader} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.accTitle}>{title}</Text>
      <Ionicons name={isOpen ? "chevron-down" : "chevron-forward"} size={20} color="#AAA" />
    </TouchableOpacity>
    {isOpen && <View style={styles.accBody}>{children}</View>}
  </View>
);

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Gallery
  galleryContainer: { width: width, height: width, backgroundColor: '#F5F5F5', position: 'relative' },
  galleryImg: { width: width, height: width, resizeMode: 'cover' },
  placeholderImg: { justifyContent: 'center', alignItems: 'center' },
  floatingBack: { position: 'absolute', top: 40, left: 16, backgroundColor: 'rgba(0,0,0,0.4)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  floatingShare: { position: 'absolute', top: 40, right: 16, backgroundColor: 'rgba(0,0,0,0.4)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  imageCounter: { position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  counterText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  // Info Section
  infoSection: { padding: 16, backgroundColor: '#FFF' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  currencySymbol: { color: '#FF4747', fontSize: 16, fontWeight: 'bold', marginTop: 4, marginRight: 2 },
  currentPrice: { fontSize: 32, fontWeight: '900', color: '#FF4747' },
  discountBadge: { backgroundColor: '#FFEDED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 10, alignSelf: 'center' },
  discountText: { color: '#FF4747', fontSize: 12, fontWeight: '700' },
  oldPrice: { fontSize: 14, textDecorationLine: 'line-through', color: '#999', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '600', color: '#111', lineHeight: 22, marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontWeight: 'bold', fontSize: 13, color: '#333' },
  reviewCount: { color: '#888', fontSize: 13, marginHorizontal: 8 },
  soldText: { color: '#888', fontSize: 13 },

  divider: { height: 8, backgroundColor: '#F4F4F4' },

  // Logistics
  logisticsSection: { padding: 16, backgroundColor: '#FFF' },
  logisticsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  logisticsLabel: { width: 70, color: '#888', fontSize: 13, fontWeight: '500' },
  freeShippingText: { fontWeight: 'bold', color: '#333', fontSize: 14, marginBottom: 2 },
  deliveryEstimate: { color: '#555', fontSize: 13 },
  serviceText: { color: '#555', fontSize: 13 },

  // Shop
  shopCard: { padding: 16, backgroundColor: '#FFF' },
  shopHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shopAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF4747', alignItems: 'center', justifyContent: 'center' },
  shopAvatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  shopName: { fontWeight: '700', fontSize: 15, marginBottom: 2 },
  shopMeta: { fontSize: 12, color: '#FFB800', fontWeight: '600' },
  followBtn: { borderWidth: 1, borderColor: '#FF4747', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  followBtnText: { color: '#FF4747', fontWeight: '600', fontSize: 13 },

  // Accordion
  accContainer: { backgroundColor: '#FFF' },
  accHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  accTitle: { fontWeight: '700', fontSize: 15, color: '#111' },
  accBody: { paddingHorizontal: 16, paddingBottom: 20 },
  descText: { fontSize: 14, lineHeight: 22, color: '#444' },

  // Reviews
  addCommentContainer: { backgroundColor: '#F9F9F9', padding: 16, borderRadius: 12, marginBottom: 20 },
  commentLabel: { fontWeight: '700', fontSize: 14, marginBottom: 10 },
  starRatingSelector: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  commentInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 12, minHeight: 80, textAlignVertical: 'top' },
  submitCommentBtn: { backgroundColor: '#FF4747', padding: 12, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  submitCommentText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  reviewItem: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 15 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  reviewerName: { fontWeight: '600', fontSize: 13, color: '#333', marginBottom: 2 },
  reviewDate: { fontSize: 11, color: '#999', marginLeft: 'auto' },
  reviewBody: { fontSize: 13, color: '#444', lineHeight: 20 },

  // Bottom Bar (AliExpress Style)
  bottomBar: { 
    position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', 
    borderTopWidth: 1, borderTopColor: '#E5E5E5', flexDirection: 'row', 
    paddingHorizontal: 12, paddingVertical: 10, paddingBottom: 24, alignItems: 'center' 
  },
  bottomIconBtn: { alignItems: 'center', justifyContent: 'center', width: 50 },
  bottomIconText: { fontSize: 10, color: '#555', marginTop: 2 },
  actionButtons: { flex: 1, flexDirection: 'row', marginLeft: 10, gap: 8 },
  cartBtn: { flex: 1, backgroundColor: '#FF9900', height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cartBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  buyBtn: { flex: 1, backgroundColor: '#FF4747', height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  buyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});

export default YsStorePDP;