import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
// import man from "@/assets/images/man.jpg"
import YS from "@/assets/images/Ys.png"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const CURRENT_USER_ID = "client_1";
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
};

const initialMessages = [
  {
    id: "1",
    senderId: "store_1",
    text: "Hello 👋 Welcome to YsStore. How can we help you today?",
    createdAt: "09:12 AM",
    type: "text",
    status: "seen",
  },
  {
    id: "2",
    senderId: "client_1",
    text: "Hi, I want to confirm if this product is still available.",
    createdAt: "09:13 AM",
    type: "text",
    status: "seen",
  },
  {
    id: "3",
    senderId: "store_1",
    text: "Yes, it is available right now. You can also place the order directly here.",
    createdAt: "09:14 AM",
    type: "text",
    status: "seen",
  },
  {
    id: "4",
    senderId: "client_1",
    text: "Okay, what is the delivery time within Katsina?",
    createdAt: "09:15 AM",
    type: "text",
    status: "seen",
  },
  {
    id: "5",
    senderId: "store_1",
    text: "Delivery usually takes 1 to 2 days depending on your location.",
    createdAt: "09:16 AM",
    type: "text",
    status: "seen",
  },
];

const productPreview = {
  id: "prod_1",
  name: "Wireless Bluetooth Headset",
  price: 18500,
  image:
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200&auto=format&fit=crop",
};

const ChatPage = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const flatListRef = useRef(null);

  const chatMessages = useMemo(() => [...messages], [messages]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: CURRENT_USER_ID,
      text: trimmed,
      createdAt: formatTime(new Date()),
      type: "text",
      status: "sent",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const autoReply = {
        id: `${Date.now()}_store`,
        senderId: "store_1",
        text: "Thanks for your message. Our store team will respond shortly.",
        createdAt: formatTime(new Date()),
        type: "text",
        status: "seen",
      };
      setMessages((prev) => [...prev, autoReply]);
      setIsTyping(false);
    }, 1200);
  };

  const renderItem = ({ item }) => {
    const isMine = item.senderId === CURRENT_USER_ID;

    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.myMessageRow : styles.otherMessageRow,
        ]}
      >
        {!isMine && (
          <Image
            source={YS}
            style={styles.avatar}
          />
        )}

        <View style={[styles.messageContent, isMine && styles.myMessageContent]}>
          {!isMine && <Text style={styles.senderName}>YsStore Shop</Text>}

          <View
            style={[
              styles.bubble,
              isMine ? styles.myBubble : styles.otherBubble,
            ]}
          >
            <Text style={[styles.messageText, isMine && styles.myMessageText]}>
              {item.text}
            </Text>

            <View style={styles.metaRow}>
              <Text style={[styles.messageTime, isMine && styles.myMessageTime]}>
                {item.createdAt}
              </Text>
              {isMine && (
                <Ionicons
                  name={item.status === "seen" ? "checkmark-done" : "checkmark"}
                  size={14}
                  color={COLORS.white}
                  style={{ marginLeft: 5 }}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tomato} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
              <Image
                source={YS}
                style={styles.headerAvatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.storeName}>YsStore Official Shop</Text>
                <View style={styles.statusRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.storeStatus}>
                    {isTyping ? "typing..." : "online now"}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="call-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.productCardWrapper}>
          <View style={styles.productCard}>
            <Image source={{ uri: productPreview.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text numberOfLines={1} style={styles.productTitle}>
                {productPreview.name}
              </Text>
              <Text style={styles.productPrice}>
                ₦{productPreview.price.toLocaleString()}
              </Text>
              <Text style={styles.productSubtext}>Product discussion room</Text>
            </View>
            <TouchableOpacity style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chatRoomCard}>
          <View style={styles.chatRoomHeader}>
            <View>
              <Text style={styles.chatRoomTitle}>Chat Room</Text>
              <Text style={styles.chatRoomSubTitle}>Talk directly with the store about this product</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Live</Text>
            </View>
          </View>

          <Text style={styles.dayLabel}>Today</Text>

          <FlatList
            ref={flatListRef}
            data={chatMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        </View>

        <View style={styles.quickActionRow}>
          <TouchableOpacity style={styles.quickChip}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={16} color={COLORS.tomato} />
            <Text style={styles.quickChipText}>Delivery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickChip}>
            <Ionicons name="cube-outline" size={16} color={COLORS.sky} />
            <Text style={styles.quickChipText}>Availability</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickChip}>
            <Ionicons name="pricetag-outline" size={16} color={COLORS.tomato} />
            <Text style={styles.quickChipText}>Price</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={24} color={COLORS.tomato} />
          </TouchableOpacity>

          <View style={styles.inputBox}>
            <TextInput
              placeholder="Type your message..."
              placeholderTextColor={COLORS.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              style={styles.input}
            />
            <TouchableOpacity>
              <Ionicons name="happy-outline" size={22} color={COLORS.sky} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    <StatusBar barStyle="auto" backgroundColor="white" />
    </SafeAreaView>
  );
};

const formatTime = (date) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  storeName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginRight: 6,
  },
  storeStatus: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.95,
  },
  productCardWrapper: {
    marginTop: -16,
    paddingHorizontal: 16,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.sky,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.skySoft,
  },
  productImage: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: COLORS.skySoft,
  },
  productInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.tomato,
    marginTop: 4,
  },
  productSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  viewBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: COLORS.sky,
  },
  viewBtnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 12,
  },
  chatRoomCard: {
    flex: 1,
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  chatRoomHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.skySoft,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatRoomTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  chatRoomSubTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  badge: {
    backgroundColor: COLORS.tomato,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 11,
  },
  dayLabel: {
    alignSelf: "center",
    backgroundColor: COLORS.tomatoSoft,
    color: COLORS.tomato,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  messageRow: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  otherMessageRow: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
  },
  messageContent: {
    maxWidth: "78%",
  },
  myMessageContent: {
    alignItems: "flex-end",
  },
  senderName: {
    fontSize: 11,
    color: COLORS.sky,
    marginBottom: 4,
    fontWeight: "700",
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  myBubble: {
    backgroundColor: COLORS.tomato,
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: COLORS.skySoft,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#CBEFFF",
  },
  messageText: {
    color: COLORS.textDark,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  myMessageText: {
    color: COLORS.white,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 6,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  myMessageTime: {
    color: COLORS.white,
    opacity: 0.9,
  },
  quickActionRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  quickChipText: {
    color: COLORS.textDark,
    fontWeight: "700",
    fontSize: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 22 : 14,
    backgroundColor: COLORS.bg,
    gap: 10,
  },
  attachBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.tomatoSoft,
  },
  inputBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 50,
    maxHeight: 120,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.skySoft,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    maxHeight: 100,
    paddingTop: 4,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.sky,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.sky,
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default ChatPage;