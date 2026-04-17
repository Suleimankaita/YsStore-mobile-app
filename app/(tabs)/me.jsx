import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Animated,
  Platform,
  Modal,
  Pressable,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const getTheme = () => {
  return {
    primary: '#FF6347',
    primaryDeep: '#FF6347',
    secondary: '#38BDF8',
    bg: '#F3F4F6',
    card: '#FFFFFF',
    text: '#111827',
    subText: '#6B7280',
    border: '#E5E7EB',
    red: '#EF4444',
    green: '#22C55E',
    gold: '#F59E0B',
    orange: '#FB923C',
    softOrange: '#FFF1EB',
    softBlue: '#EAF8FF',
    shadow: '#000000',
  };
};

const recommendedProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Earbuds Pro',
    price: '₦12,500',
    oldPrice: '₦18,000',
    sold: '2,341 sold',
    image:
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Smart Watch Series X',
    price: '₦24,000',
    oldPrice: '₦31,500',
    sold: '1,209 sold',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Fast Charger Type-C 45W',
    price: '₦4,800',
    oldPrice: '₦7,000',
    sold: '5,102 sold',
    image:
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'Premium Phone Case Shockproof',
    price: '₦3,200',
    oldPrice: '₦5,500',
    sold: '3,987 sold',
    image:
      'https://images.unsplash.com/photo-1603314585442-ee3b3c16fbcf?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '5',
    name: 'Mini Power Bank 10000mAh',
    price: '₦10,900',
    oldPrice: '₦14,200',
    sold: '1,876 sold',
    image:
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '6',
    name: 'Android Gaming Phone Cooler',
    price: '₦7,700',
    oldPrice: '₦9,900',
    sold: '642 sold',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
  },
];

const AnimatedButton = ({ children, onPress, style }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.975,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 45,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const OrderIconItem = ({ icon, label, value, color, theme }) => (
  <AnimatedButton style={styles.orderIconItem}>
    <View style={[styles.orderIconCircle, { backgroundColor: `${color}15` }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      {value ? (
        <View style={[styles.orderBadge, { backgroundColor: theme.red }]}>
          <Text style={styles.orderBadgeText}>{value}</Text>
        </View>
      ) : null}
    </View>
    <Text style={[styles.orderIconLabel, { color: theme.subText }]} numberOfLines={1}>
      {label}
    </Text>
  </AnimatedButton>
);

const ToolItem = ({ icon, label, color, theme }) => (
  <AnimatedButton style={styles.toolItem}>
    <View style={[styles.toolCircle, { backgroundColor: `${color}14` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={[styles.toolText, { color: theme.text }]} numberOfLines={2}>
      {label}
    </Text>
  </AnimatedButton>
);

const ProductCard = ({ item, theme }) => (
  <AnimatedButton
    style={[
      styles.productCard,
      {
        backgroundColor: theme.card,
        borderColor: theme.border,
      },
    ]}
  >
    <Image source={{ uri: item.image }} style={styles.productImage} />
    <View style={styles.productInfo}>
      <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
        {item.name}
      </Text>

      <Text style={[styles.productPrice, { color: theme.primary }]}>{item.price}</Text>
      <Text style={[styles.productOldPrice, { color: theme.subText }]}>{item.oldPrice}</Text>

      <View style={styles.productMetaRow}>
        <Text style={[styles.productSold, { color: theme.subText }]}>{item.sold}</Text>
        <TouchableOpacity style={[styles.cartMiniBtn, { backgroundColor: theme.primary }]}>
          <Ionicons name="cart-outline" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  </AnimatedButton>
);

const RowItem = ({ icon, title, extra, color, theme }) => (
  <AnimatedButton
    style={[
      styles.rowItem,
      {
        backgroundColor: theme.card,
        borderColor: theme.border,
      },
    ]}
  >
    <View style={styles.rowLeft}>
      <View style={[styles.rowIconWrap, { backgroundColor: `${color}14` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
        {extra ? <Text style={[styles.rowExtra, { color: theme.subText }]}>{extra}</Text> : null}
      </View>
    </View>
    <Ionicons name="chevron-forward" size={16} color={theme.subText} />
  </AnimatedButton>
);

export default function PremiumMenuScreen() {
  const theme = useMemo(() => getTheme(), []);

  const [isLogoutVisible, setLogoutVisible] = useState(false);
  const modalY = useRef(new Animated.Value(height)).current;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 25,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleLogoutModal = (show) => {
    if (show) {
      setLogoutVisible(true);
      Animated.timing(modalY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalY, {
        toValue: height,
        duration: 260,
        useNativeDriver: true,
      }).start(() => setLogoutVisible(false));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      <LinearGradient
        colors={['#FF6347', '#38BDF8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerWrap}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="scan-outline" size={22} color="white" />
          </TouchableOpacity>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="chatbubble-ellipses-outline" size={21} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="notifications-outline" size={21} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="settings-outline" size={21} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.accountMiniBar}>
          <Text style={styles.accountMiniTitle}>My Account</Text>
          <Text style={styles.accountMiniSub}>Manage orders, wallet, coupons and settings</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Animated.View
          style={[
            styles.profileCard,
            {
              backgroundColor: theme.card,
              shadowColor: theme.shadow,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.profileRow}>
            <View style={styles.profileLeft}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?u=ysstore-user' }}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <View style={styles.profileNameRow}>
                  <Text style={[styles.profileName, { color: theme.text }]}>John Adam</Text>
                  <View style={styles.goldTag}>
                    <Text style={styles.goldTagText}>Gold</Text>
                  </View>
                </View>
                <Text style={[styles.profileHandle, { color: theme.subText }]}>@john_creative</Text>
                <Text style={[styles.profileSubText, { color: theme.subText }]}>
                  Member since 2024
                </Text>
              </View>
            </View>

            <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: theme.softBlue }]}>
              <Feather name="edit-2" size={15} color={theme.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileStatsRow}>
            <View style={styles.profileStat}>
              <Text style={[styles.profileStatValue, { color: theme.text }]}>1,240</Text>
              <Text style={[styles.profileStatLabel, { color: theme.subText }]}>Points</Text>
            </View>
            <View style={[styles.profileDivider, { backgroundColor: theme.border }]} />
            <View style={styles.profileStat}>
              <Text style={[styles.profileStatValue, { color: theme.text }]}>₦25,400</Text>
              <Text style={[styles.profileStatLabel, { color: theme.subText }]}>Wallet</Text>
            </View>
            <View style={[styles.profileDivider, { backgroundColor: theme.border }]} />
            <View style={styles.profileStat}>
              <Text style={[styles.profileStatValue, { color: theme.text }]}>6</Text>
              <Text style={[styles.profileStatLabel, { color: theme.subText }]}>Coupons</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.memberBanner, { backgroundColor: theme.softOrange }]}>
            <View style={styles.memberBannerLeft}>
              <View style={[styles.memberBannerIcon, { backgroundColor: theme.primary }]}>
                <Ionicons name="diamond-outline" size={15} color="white" />
              </View>
              <View>
                <Text style={[styles.memberBannerTitle, { color: theme.text }]}>Member Benefits</Text>
                <Text style={[styles.memberBannerSubTitle, { color: theme.subText }]}>
                  Special discounts and premium offers
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.pageContent,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>My Orders</Text>
              <TouchableOpacity>
                <Text style={[styles.sectionLink, { color: theme.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.orderIconsRow}>
              <OrderIconItem icon="credit-card-outline" label="To Pay" value="2" color={theme.primary} theme={theme} />
              <OrderIconItem icon="package-variant" label="To Ship" value="5" color={theme.secondary} theme={theme} />
              <OrderIconItem icon="truck-delivery-outline" label="To Receive" value="1" color={theme.gold} theme={theme} />
              <OrderIconItem icon="star-outline" label="To Review" value="8" color={theme.green} theme={theme} />
              <OrderIconItem icon="archive-arrow-undo-outline" label="Refunds" value="" color={theme.orange} theme={theme} />
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Tools</Text>
            </View>

            <View style={styles.toolsGrid}>
              <ToolItem icon="wallet-outline" label="Wallet" color={theme.primary} theme={theme} />
              <ToolItem icon="ticket-outline" label="Coupons" color={theme.gold} theme={theme} />
              <ToolItem icon="gift-outline" label="Coins" color={theme.orange} theme={theme} />
              <ToolItem icon="heart-outline" label="Wishlist" color={theme.red} theme={theme} />
              <ToolItem icon="location-outline" label="Address" color={theme.secondary} theme={theme} />
              <ToolItem icon="time-outline" label="Recently Viewed" color={theme.orange} theme={theme} />
              <ToolItem icon="card-outline" label="Cards" color={theme.primary} theme={theme} />
              <ToolItem icon="shield-checkmark-outline" label="Security" color={theme.green} theme={theme} />
            </View>
          </View>

          <View style={styles.promoCardsRow}>
            <AnimatedButton
              style={[
                styles.promoCard,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text style={styles.promoTag}>FLASH SALE</Text>
              <Text style={styles.promoTitle}>Up to 60% Off</Text>
              <Text style={styles.promoDesc}>Big daily savings on gadgets and fashion</Text>
            </AnimatedButton>

            <AnimatedButton
              style={[
                styles.promoCard,
                { backgroundColor: theme.secondary },
              ]}
            >
              <Text style={styles.promoTag}>NEW USER</Text>
              <Text style={styles.promoTitle}>Free Shipping</Text>
              <Text style={styles.promoDesc}>Selected stores with discount delivery</Text>
            </AnimatedButton>
          </View>

          <View style={styles.sectionHeaderSpace}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Services</Text>
          </View>

          <RowItem
            icon="notifications-outline"
            title="Notifications"
            extra="4 unread updates"
            color={theme.secondary}
            theme={theme}
          />
          <RowItem
            icon="chatbubble-ellipses-outline"
            title="Help Center"
            extra="Buyer protection and support"
            color={theme.primary}
            theme={theme}
          />
          <RowItem
            icon="settings-outline"
            title="Settings"
            extra="Manage account and preferences"
            color={theme.orange}
            theme={theme}
          />
          <RowItem
            icon="shield-checkmark-outline"
            title="Privacy & Security"
            extra="Protect your account"
            color={theme.green}
            theme={theme}
          />

          <AnimatedButton
            onPress={() => toggleLogoutModal(true)}
            style={[
              styles.logoutCard,
              {
                backgroundColor: theme.card,
                borderColor: '#FECACA',
              },
            ]}
          >
            <View style={styles.logoutLeft}>
              <View style={[styles.logoutIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="log-out-outline" size={18} color={theme.red} />
              </View>
              <Text style={[styles.logoutTitle, { color: theme.red }]}>Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.red} />
          </AnimatedButton>

          <View style={styles.sectionHeaderSpace}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recommended For You</Text>
            <TouchableOpacity>
              <Text style={[styles.sectionLink, { color: theme.primary }]}>More</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productGrid}>
            {recommendedProducts.map((item) => (
              <ProductCard key={item.id} item={item} theme={theme} />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <Modal visible={isLogoutVisible} transparent animationType="none">
        <Pressable style={styles.modalOverlay} onPress={() => toggleLogoutModal(false)}>
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                backgroundColor: theme.card,
                transform: [{ translateY: modalY }],
              },
            ]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
            <View style={styles.sheetContent}>
              <View style={[styles.sheetIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle" size={48} color={theme.red} />
              </View>

              <Text style={[styles.sheetTitle, { color: theme.text }]}>Sign out now?</Text>
              <Text style={[styles.sheetText, { color: theme.subText }]}>
                You will need to sign in again to access your orders, coupons, wallet, and saved items.
              </Text>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: theme.red }]}
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={styles.confirmBtnText}>Yes, Sign Out</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.border }]}
                onPress={() => toggleLogoutModal(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Stay Logged In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerWrap: {
    paddingTop: Platform.OS === 'ios' ? 20 : 38,
    paddingHorizontal: 14,
    paddingBottom: 26,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  accountMiniBar: {
    marginTop: 18,
  },

  accountMiniTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },

  accountMiniSub: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },

  profileCard: {
    marginHorizontal: 14,
    borderRadius: 20,
    padding: 15,
    marginTop: 10,
    elevation: 10,
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },

  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  profileLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },

  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  profileName: {
    fontSize: 18,
    fontWeight: '900',
  },

  goldTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    marginLeft: 8,
  },

  goldTagText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '900',
  },

  profileHandle: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '700',
  },

  profileSubText: {
    fontSize: 11,
    marginTop: 3,
  },

  editProfileBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 2,
    paddingBottom: 4,
  },

  profileStat: {
    flex: 1,
    alignItems: 'center',
  },

  profileStatValue: {
    fontSize: 15,
    fontWeight: '900',
  },

  profileStatLabel: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '700',
  },

  profileDivider: {
    width: 1,
    height: 28,
  },

  memberBanner: {
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  memberBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  memberBannerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  memberBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  memberBannerSubTitle: {
    fontSize: 11,
    marginTop: 2,
  },

  pageContent: {
    paddingHorizontal: 14,
    marginTop: 14,
  },

  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionHeaderSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
  },

  sectionLink: {
    fontSize: 12,
    fontWeight: '800',
  },

  orderIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  orderIconItem: {
    width: (width - 56) / 5,
    alignItems: 'center',
  },

  orderIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },

  orderBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  orderBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '900',
  },

  orderIconLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },

  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  toolItem: {
    width: (width - 56) / 4,
    alignItems: 'center',
    marginBottom: 16,
  },

  toolCircle: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  toolText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },

  promoCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  promoCard: {
    width: (width - 34) / 2,
    minHeight: 118,
    borderRadius: 18,
    padding: 14,
    justifyContent: 'space-between',
  },

  promoTag: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '900',
  },

  promoTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },

  promoDesc: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },

  rowItem: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  rowTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  rowExtra: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
  },

  logoutCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoutIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  logoutTitle: {
    fontSize: 14,
    fontWeight: '900',
  },

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  productCard: {
    width: (width - 34) / 2,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },

  productImage: {
    width: '100%',
    height: 150,
  },

  productInfo: {
    padding: 10,
  },

  productName: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    minHeight: 36,
  },

  productPrice: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 8,
  },

  productOldPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },

  productMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  productSold: {
    fontSize: 11,
    fontWeight: '600',
  },

  cartMiniBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'flex-end',
  },

  bottomSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 34,
  },

  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 18,
  },

  sheetContent: {
    alignItems: 'center',
  },

  sheetIconWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  sheetTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },

  sheetText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 12,
  },

  confirmBtn: {
    width: '100%',
    padding: 17,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },

  confirmBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },

  cancelBtn: {
    width: '100%',
    padding: 17,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },

  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});