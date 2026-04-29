import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const tabs = [
  { key: "toPay", label: "To Pay", icon: "card-outline" },
  { key: "toShip", label: "To Ship", icon: "cube-outline" },
  { key: "toReceive", label: "To Receive", icon: "bicycle-outline" },
  { key: "refunds", label: "Refunds", icon: "refresh-outline" },
];

const orders = [
  {
    id: "YS-20391",
    status: "toPay",
    shop: "YsStore Mall",
    product: "Oraimo Smart Watch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    price: 18500,
    qty: 1,
    date: "27 Apr 2026",
  },
  {
    id: "YS-20392",
    status: "toShip",
    shop: "Katsina Gadgets",
    product: "Wireless Bluetooth Speaker",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
    price: 9500,
    qty: 2,
    date: "26 Apr 2026",
  },
  {
    id: "YS-20393",
    status: "toReceive",
    shop: "Alhaji Store",
    product: "Men Fashion Sneakers",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    price: 24000,
    qty: 1,
    date: "25 Apr 2026",
  },
  {
    id: "YS-20394",
    status: "refunds",
    shop: "Beauty World",
    product: "Skin Care Package",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883",
    price: 12000,
    qty: 1,
    date: "23 Apr 2026",
    refundStatus: "Processing",
  },
];

const formatMoney = (amount) => {
  return `₦${Number(amount).toLocaleString()}`;
};

export default function OrderStatusScreen() {
  const { screenName } = useLocalSearchParams();
  useEffect(() => {
    if (screenName) {
      setActiveTab(screenName);
    }
  }, [screenName]);
  const [activeTab, setActiveTab] = useState(screenName || "toPay");

  const filteredOrders = useMemo(() => {
    return orders.filter((item) => item.status === activeTab);
  }, [activeTab]);

  const getStatusInfo = (status) => {
    switch (status) {
      case "toPay":
        return {
          label: "Awaiting Payment",
          color: "#ff6347",
          bg: "#fff1ee",
        };
      case "toShip":
        return {
          label: "Preparing Shipment",
          color: "#0ea5e9",
          bg: "#eaf8ff",
        };
      case "toReceive":
        return {
          label: "On The Way",
          color: "#16a34a",
          bg: "#ecfdf3",
        };
      case "refunds":
        return {
          label: "Refund Request",
          color: "#9333ea",
          bg: "#f5edff",
        };
      default:
        return {
          label: "Order",
          color: "#555",
          bg: "#eee",
        };
    }
  };

  const renderActionButtons = (item) => {
    // Placeholder handlers
    const handleCancel = () => {
      // TODO: Implement cancel logic
      alert("Cancel order feature coming soon.");
    };
    const handlePayNow = () => {
      // TODO: Implement pay now logic
      alert("Pay now feature coming soon.");
    };
    const handleMessageSeller = () => {
      alert("Message seller feature coming soon.");
    };
    const handleViewDetails = () => {
      alert("View details feature coming soon.");
    };
    const handleTrackOrder = () => {
      alert("Track order feature coming soon.");
    };
    const handleConfirmReceived = () => {
      alert("Confirm received feature coming soon.");
    };
    const handleRefundDetails = () => {
      alert("Refund details feature coming soon.");
    };
    const handleContactSupport = () => {
      alert("Contact support feature coming soon.");
    };

    if (item.status === "toPay") {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.outlineBtn} onPress={handleCancel}>
            <Text style={styles.outlineText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={handlePayNow}>
            <Text style={styles.primaryText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (item.status === "toShip") {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={handleMessageSeller}
          >
            <Text style={styles.outlineText}>Message Seller</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleViewDetails}
          >
            <Text style={styles.primaryText}>View Details</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (item.status === "toReceive") {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={handleTrackOrder}
          >
            <Text style={styles.outlineText}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleConfirmReceived}
          >
            <Text style={styles.primaryText}>Confirm Received</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={handleRefundDetails}
        >
          <Text style={styles.outlineText}>Refund Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleContactSupport}
        >
          <Text style={styles.primaryText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderOrder = ({ item }) => {
    const status = getStatusInfo(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.shopRow}>
            <Ionicons name="storefront-outline" size={17} color="#111827" />
            <Text style={styles.shopName}>{item.shop}</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.productRow}>
          <Image source={{ uri: item.image }} style={styles.productImage} />

          <View style={styles.productInfo}>
            <Text numberOfLines={2} style={styles.productName}>
              {item.product}
            </Text>

            <Text style={styles.orderId}>Order ID: {item.id}</Text>
            <Text style={styles.date}>Date: {item.date}</Text>

            {item.refundStatus && (
              <Text style={styles.refundText}>Refund: {item.refundStatus}</Text>
            )}
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.qty}>Qty: {item.qty}</Text>
          <Text style={styles.total}>
            Total: {formatMoney(item.price * item.qty)}
          </Text>
        </View>

        {renderActionButtons(item)}
      </View>
    );
  };

  const EmptyState = () => {
    const current = tabs.find((tab) => tab.key === activeTab);
    const handleStartShopping = () => {
      // TODO: Implement navigation to shop page
      alert("Navigate to shop page feature coming soon.");
    };
    return (
      <View style={styles.emptyBox}>
        <View style={styles.emptyIcon}>
          <Ionicons name={current?.icon} size={38} color="#ff6347" />
        </View>
        <Text style={styles.emptyTitle}>No orders found</Text>
        <Text style={styles.emptyText}>
          You do not have any {current?.label.toLowerCase()} orders right now.
        </Text>
        <TouchableOpacity style={styles.shopBtn} onPress={handleStartShopping}>
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>Manage your purchases easily</Text>
        </View>

        <TouchableOpacity style={styles.searchBtn}>
          <Feather name="search" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <View style={styles.summaryIcon}>
            <MaterialIcons name="shopping-bag" size={28} color="#fff" />
          </View>

          <View>
            <Text style={styles.summaryTitle}>Order Center</Text>
            <Text style={styles.summaryText}>
              Track payment, shipping and refunds
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tab, active && styles.activeTab]}
              >
                <Ionicons
                  name={tab.icon}
                  size={19}
                  color={active ? "#fff" : "#64748b"}
                />
                <Text style={[styles.tabText, active && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748b",
  },

  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  summaryCard: {
    marginHorizontal: 18,
    marginBottom: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#0ea5e9",
  },

  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#ff6347",
    justifyContent: "center",
    alignItems: "center",
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#fff",
  },

  summaryText: {
    marginTop: 3,
    fontSize: 13,
    color: "#e0f2fe",
  },

  tabsWrapper: {
    marginBottom: 8,
  },

  tabsContainer: {
    paddingHorizontal: 18,
    gap: 10,
  },

  tab: {
    height: 43,
    paddingHorizontal: 15,
    borderRadius: 22,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    elevation: 1,
  },

  activeTab: {
    backgroundColor: "#ff6347",
  },

  tabText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
  },

  activeTabText: {
    color: "#fff",
  },

  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 14,
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  shopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },

  shopName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "900",
  },

  productRow: {
    flexDirection: "row",
    gap: 12,
  },

  productImage: {
    width: 86,
    height: 86,
    borderRadius: 18,
    backgroundColor: "#e5e7eb",
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 21,
  },

  orderId: {
    marginTop: 7,
    fontSize: 12,
    color: "#64748b",
  },

  date: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748b",
  },

  refundText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "800",
    color: "#9333ea",
  },

  totalRow: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  qty: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },

  total: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },

  actionRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  outlineBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },

  outlineText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0ea5e9",
  },

  primaryBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#ff6347",
  },

  primaryText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#fff",
  },

  emptyBox: {
    marginTop: 70,
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: "#fff1ee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },

  shopBtn: {
    marginTop: 18,
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },

  shopBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
});
