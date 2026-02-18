import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, 
  SafeAreaView, Dimensions, StatusBar, Alert, ActivityIndicator, Modal, TextInput
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// ✅ FIX: Default Import for Paystack
import {usePaystack} from 'react-native-paystack-webview';

const { width } = Dimensions.get('window');

// ---------------- MOCK DATA ----------------
const PRODUCT = {
  id: 'ys-99',
  name: "YS Ultra Smartwatch Series 9",
  price: 48000,
  originalPrice: 60000,
  description: "Experience the next level of wearable technology. The YS Ultra Smartwatch Series 9 features a breathtaking edge-to-edge AMOLED display that remains visible even under direct sunlight.\n\nCrafted from aerospace-grade titanium, it’s built to withstand the toughest environments while maintaining a lightweight profile.",
  images: [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000',
  ],
  initialReviews: [
    { id: 1, user: "Amina K.", rating: 5, date: "2 days ago", comment: "Absolutely love the AMOLED display! Battery lasts me exactly 2 days.", avatar: "https://i.pravatar.cc/150?u=amina" },
    { id: 2, user: "Chidi O.", rating: 4, date: "1 week ago", comment: "Very premium feel. The titanium build is solid.", avatar: "https://i.pravatar.cc/150?u=chidi" }
  ]
};

// 🔴 REPLACE THIS WITH YOUR PUBLIC KEY FROM PAYSTACK DASHBOARD
const PAYSTACK_PUBLIC_KEY = "pk_test_162884f06e28545f737d29fe112e0fd09da43cac"; 

const YsStorePDP = () => {
  // --- STATE ---
  const { popup } = usePaystack();
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(2);
  const [isLiked, setIsLiked] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [expandedSection, setExpandedSection] = useState('desc');
  const [timer, setTimer] = useState(2 * 60 * 60 + 14 * 60 + 39); // 2h 14m 39s
  const [paystackVisible, setPaystackVisible] = useState(false);

  // --- COMMENT SECTION STATE ---
  const [reviews, setReviews] = useState(PRODUCT.initialReviews);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(5);
  
  // --- EFFECT: COUNTDOWN TIMER ---
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

  // --- HANDLERS ---
  const handleScroll = (event) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeSlide) setActiveSlide(slide);
  };

  const handleBuyNow = () => {
    popup.checkout({
      email: "customer@email.com",
      amount: PRODUCT.price * quantity * 100, // kobo
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
    Alert.alert("Success", "Your review has been posted!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn}>
          {/* <Ionicons name="chevron-back" size={24} color="black" /> */}
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{PRODUCT.name}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-social-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="cart-outline" size={26} color="black" />
            {cartCount > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* 2. GALLERY */}
        <View style={styles.galleryContainer}>
          <ScrollView 
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={handleScroll} scrollEventThrottle={16}
          >
            {PRODUCT.images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.galleryImg} />
            ))}
          </ScrollView>
          <View style={styles.discountBadge}><Text style={styles.discountText}>-20%</Text></View>
          <TouchableOpacity style={styles.wishlistFloat} onPress={() => setIsLiked(!isLiked)}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color="#FF4747" />
          </TouchableOpacity>
          <View style={styles.pagination}>
            {PRODUCT.images.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeSlide && styles.activeDot]} />
            ))}
          </View>
        </View>

        {/* 3. PRODUCT INFO */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{PRODUCT.name}</Text>
          <View style={styles.ratingRow}>
            <View style={{ flexDirection: 'row', gap: 2 }}>
              {[1,2,3,4,5].map(s => <Ionicons key={s} name="star" size={14} color="#FFB800" />)}
            </View>
            <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
            <Text style={styles.stockText}>● Only 5 left</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₦{PRODUCT.price.toLocaleString()}</Text>
            <Text style={styles.oldPrice}>₦{PRODUCT.originalPrice.toLocaleString()}</Text>
          </View>
        </View>

        {/* 4. FLASH SALE */}
        <View style={styles.flashBanner}>
          <View>
            <Text style={styles.flashTitle}>🔥 FLASH SALE</Text>
            <Text style={styles.flashSub}>Ends Tonight</Text>
          </View>
          <View style={styles.timerBox}>
            <Text style={styles.timerDigits}>{formatTime(timer)}</Text>
          </View>
        </View>

        {/* 5. SHOP CARD */}
        <View style={styles.shopCard}>
          <View style={styles.shopHeader}>
             <View style={styles.shopAvatar}><MaterialCommunityIcons name="storefront" size={24} color="#FFF" /></View>
             <View>
                <Text style={styles.shopName}>YS Tech Official</Text>
                <Text style={styles.shopMeta}>98% Positive • Lagos</Text>
             </View>
          </View>
          <View style={styles.shopBtns}>
            <TouchableOpacity style={styles.btnOutline}><Text style={styles.btnTextBlack}>Chat</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnSolid}><Text style={styles.btnTextWhite}>Visit Shop</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 6. DESCRIPTION */}
        <Accordion 
          title="Product Description" 
          isOpen={expandedSection === 'desc'} 
          onPress={() => setExpandedSection(expandedSection === 'desc' ? '' : 'desc')}
        >
          <Text style={styles.descText}>{PRODUCT.description}</Text>
          <View style={{marginTop: 10}}>
             <Bullet text="48H Battery Life" />
             <Bullet text="Water Resistant 50m" />
             <Bullet text="Titanium Chassis" />
          </View>
        </Accordion>

        {/* 7. REVIEWS & COMMENT SECTION */}
        <Accordion 
          title={`Reviews (${reviews.length})`}
          isOpen={expandedSection === 'reviews'} 
          onPress={() => setExpandedSection(expandedSection === 'reviews' ? '' : 'reviews')}
        >
          {/* Add Comment Input */}
          <View style={styles.addCommentContainer}>
            <Text style={styles.commentLabel}>Write a review</Text>
            <View style={styles.starRatingSelector}>
              {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <Ionicons 
                    name={star <= userRating ? "star" : "star-outline"} 
                    size={24} 
                    color="#FFB800" 
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput 
              style={styles.commentInput}
              placeholder="What do you think about this product?"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity style={styles.submitCommentBtn} onPress={handleAddComment}>
              <Text style={styles.submitCommentText}>Post Review</Text>
            </TouchableOpacity>
          </View>

          {/* List of Reviews */}
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

        {/* 8. TRUST */}
        <View style={styles.trustFooter}>
           <MaterialCommunityIcons name="shield-check" size={20} color="#27AE60" />
           <Text style={styles.trustText}>Secured by Paystack</Text>
        </View>

      </ScrollView>

      {/* 9. BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <View style={styles.stepper}>
          <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.stepBtn}>
            <Text style={styles.stepText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyVal}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.stepBtn}>
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.mainBuyBtn} onPress={handleBuyNow}>
          <Text style={styles.mainBuyText}>Buy Now</Text>
          <Text style={styles.mainBuySub}>₦{(PRODUCT.price * quantity).toLocaleString()}</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

// --- SUB COMPONENTS ---
const Accordion = ({ title, isOpen, onPress, children }) => (
  <View style={styles.accContainer}>
    <TouchableOpacity style={styles.accHeader} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.accTitle}>{title}</Text>
      <Ionicons name={isOpen ? "chevron-down" : "chevron-forward"} size={20} color="#000" />
    </TouchableOpacity>
    {isOpen && <View style={styles.accBody}>{children}</View>}
  </View>
);

const Bullet = ({ text }) => (
  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
    <View style={{width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#000', marginRight: 10}} />
    <Text style={{color: '#555', fontSize: 14}}>{text}</Text>
  </View>
);

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  headerTitle: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 20 },
  circleBtn: { width: 40, height: 40, borderRadius: 20,justifyContent: 'center', alignItems: 'center' },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconBtn: { position: 'relative' },
  cartBadge: { position: 'absolute', top: -4, right: -6, backgroundColor: '#000', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  galleryContainer: { width: width, height: 380, backgroundColor: '#FAFAFA', position: 'relative' },
  galleryImg: { width: width, height: 380, resizeMode: 'contain' },
  discountBadge: { position: 'absolute', top: 20, left: 20, backgroundColor: '#FF4747', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  discountText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  wishlistFloat: { position: 'absolute', top: 20, right: 20, backgroundColor: '#FFF', padding: 10, borderRadius: 30, elevation: 4 },
  pagination: { position: 'absolute', bottom: 20, flexDirection: 'row', width: '100%', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DDD' },
  activeDot: { backgroundColor: '#000', width: 24 },
  infoSection: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  reviewCount: { color: '#888', fontSize: 13, marginLeft: 6, marginRight: 12 },
  stockText: { color: '#FF4747', fontWeight: '600', fontSize: 13 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  currentPrice: { fontSize: 32, fontWeight: '900', color: '#000' },
  oldPrice: { fontSize: 18, textDecorationLine: 'line-through', color: '#AAA' },
  flashBanner: { marginHorizontal: 20, backgroundColor: '#000', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flashTitle: { color: '#FF4747', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  flashSub: { color: '#BBB', fontSize: 11, marginTop: 2 },
  timerBox: { backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  timerDigits: { color: '#FFF', fontWeight: '700', fontSize: 16, fontFamily: 'monospace' },
  shopCard: { margin: 20, padding: 16, borderRadius: 16, backgroundColor: '#FDFDFD', borderWidth: 1, borderColor: '#EEE' },
  shopHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  shopAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  shopName: { fontWeight: '700', fontSize: 15 },
  shopMeta: { fontSize: 12, color: '#777' },
  shopBtns: { flexDirection: 'row', gap: 10 },
  btnOutline: { flex: 1, borderWidth: 1, borderColor: '#DDD', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnSolid: { flex: 2, backgroundColor: '#000', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnTextBlack: { fontWeight: '600', fontSize: 13 },
  btnTextWhite: { fontWeight: '600', fontSize: 13, color: '#FFF' },
  divider: { height: 8, backgroundColor: '#F5F5F5', marginBottom: 10 },
  accContainer: { borderBottomWidth: 1, borderBottomColor: '#EEE' },
  accHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  accTitle: { fontWeight: '700', fontSize: 15 },
  accBody: { paddingHorizontal: 20, paddingBottom: 20 },
  descText: { fontSize: 15, lineHeight: 24, color: '#444', marginBottom: 15 },
  reviewItem: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#FAFAFA', paddingBottom: 15 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  reviewerName: { fontWeight: '700', fontSize: 13, color: '#333' },
  reviewDate: { fontSize: 11, color: '#AAA', marginLeft: 'auto' },
  reviewBody: { fontSize: 13, color: '#555', lineHeight: 20 },
  trustFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 24, marginBottom: 20 },
  trustText: { color: '#888', fontSize: 12, fontWeight: '500' },
  bottomBar: { 
    position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', 
    borderTopWidth: 1, borderTopColor: '#F0F0F0', flexDirection: 'row', 
    padding: 16, paddingBottom: 30, gap: 12, alignItems: 'center' 
  },
  stepper: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F7F7', 
    borderRadius: 12, height: 56, paddingHorizontal: 4 
  },
  stepBtn: { width: 40, height: '100%', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 24, fontWeight: '300', color: '#000' },
  qtyVal: { fontSize: 18, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  mainBuyBtn: { 
    flex: 1, backgroundColor: '#000', height: 56, borderRadius: 12, 
    alignItems: 'center', justifyContent: 'center', flexDirection: 'column' 
  },
  mainBuyText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  mainBuySub: { color: '#CCC', fontSize: 11, marginTop: 2 },
  
  // NEW COMMENT STYLES
  addCommentContainer: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 12, marginBottom: 20 },
  commentLabel: { fontWeight: '700', fontSize: 14, marginBottom: 10 },
  starRatingSelector: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  commentInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', borderRadius: 8, padding: 12, minHeight: 80, textAlignVertical: 'top' },
  submitCommentBtn: { backgroundColor: '#000', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  submitCommentText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});

export default YsStorePDP;