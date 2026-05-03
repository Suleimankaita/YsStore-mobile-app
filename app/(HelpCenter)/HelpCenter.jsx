import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  Modal,
  Alert,
  Linking,
  KeyboardAvoidingView,
  RefreshControl,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const COLORS = {
  tomato: "#ff6347",
  tomatoDark: "#ef4444",
  sky: "#38bdf8",
  skyDark: "#0284c7",
  bg: "#f4f7fb",
  white: "#ffffff",
  dark: "#0f172a",
  text: "#1f2937",
  muted: "#64748b",
  border: "#e5e7eb",
  green: "#16a34a",
  yellow: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  orangeSoft: "#fff1ee",
  skySoft: "#e0f2fe",
  greenSoft: "#dcfce7",
  redSoft: "#fee2e2",
  yellowSoft: "#fef3c7",
};

const supportInfo = {
  email: "support@ysstoreapp.com",
  phone: "+2348000000000",
  whatsapp: "+2348000000000",
  website: "https://www.ysstoreapp.com",
};

const initialFaqData = [
  {
    id: "1",
    category: "Orders",
    question: "How do I track my order?",
    answer:
      "Open the Orders page, select the order you want to track, then tap Track Order. You will see the order status, delivery progress, payment status, and store information.",
  },
  {
    id: "2",
    category: "Orders",
    question: "Why is my order still pending?",
    answer:
      "An order can remain pending if payment is not confirmed, the seller has not accepted the order, or delivery confirmation is still waiting. In YsStore, some payments may stay pending until the buyer confirms delivery.",
  },
  {
    id: "3",
    category: "Wallet",
    question: "Why is my wallet balance pending?",
    answer:
      "Pending wallet balance means the money is not yet available for withdrawal. For marketplace orders, funds can be held until the customer confirms that the product was delivered successfully.",
  },
  {
    id: "4",
    category: "Wallet",
    question: "How do I withdraw money from my wallet?",
    answer:
      "Go to Wallet, tap Withdraw, enter your bank details and amount, then submit your request. Your available balance must be enough before withdrawal can be completed.",
  },
  {
    id: "5",
    category: "Payments",
    question: "What should I do if my payment fails?",
    answer:
      "First check your network and account balance. If money was deducted but the order was not updated, contact support with your transaction reference, order ID, and payment date.",
  },
  {
    id: "6",
    category: "Account",
    question: "How do I change my password?",
    answer:
      "Open Settings, go to Security, then select Change Password. Enter your current password and your new password, then save the changes.",
  },
  {
    id: "7",
    category: "Security",
    question: "How do I protect my account?",
    answer:
      "Use a strong password, enable biometric login, turn on two-factor authentication if available, and avoid sharing your OTP, PIN, or password with anyone.",
  },
  {
    id: "8",
    category: "Delivery",
    question: "How does delivery confirmation work?",
    answer:
      "After your item is delivered, you may need to confirm delivery inside the app. This helps YsStore release pending funds to the seller and close the order safely.",
  },
];

const categories = [
  "All",
  "Orders",
  "Wallet",
  "Payments",
  "Account",
  "Security",
  "Delivery",
];

const HelpCenterScreen = ({ navigation, router }) => {
  const [faqData] = useState(initialFaqData);
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [openedFaqId, setOpenedFaqId] = useState(null);
  const [faqFeedback, setFaqFeedback] = useState({});

  const [refreshing, setRefreshing] = useState(false);

  const [ticketModal, setTicketModal] = useState(false);
  const [ticketsModal, setTicketsModal] = useState(false);
  const [ticketDetailsModal, setTicketDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Orders");
  const [ticketPriority, setTicketPriority] = useState("Normal");
  const [ticketMessage, setTicketMessage] = useState("");

  const [tickets, setTickets] = useState([
    {
      id: "YST-1001",
      subject: "Payment deducted but order not updated",
      category: "Payments",
      priority: "High",
      message:
        "I made payment but my order still shows pending. Please check this transaction.",
      status: "Open",
      date: "Today, 9:12 AM",
    },
  ]);

  const filteredFaqs = useMemo(() => {
    let data = faqData;

    if (activeCategory !== "All") {
      data = data.filter((item) => item.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    return data;
  }, [faqData, activeCategory, search]);

  const openURL = async (url, errorMessage = "Unable to open link.") => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert("Not supported", errorMessage);
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Error", errorMessage);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Replace with FAQ/ticket API refetch later.
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert("Updated", "Help Center refreshed successfully.");
    }, 700);
  }, []);

  const addRecentSearch = (value) => {
    const clean = value.trim();

    if (!clean) return;

    setRecentSearches((prev) => {
      const removedDuplicate = prev.filter(
        (item) => item.toLowerCase() !== clean.toLowerCase()
      );

      return [clean, ...removedDuplicate].slice(0, 5);
    });
  };

  const handleSearchSubmit = () => {
    addRecentSearch(search);
  };

  const clearSearch = () => {
    setSearch("");
    setOpenedFaqId(null);
  };

  const handleFaqPress = (faqId) => {
    setOpenedFaqId((prev) => (prev === faqId ? null : faqId));
  };

  const handleFaqFeedback = (faqId, value) => {
    setFaqFeedback((prev) => ({
      ...prev,
      [faqId]: value,
    }));

    Alert.alert(
      "Thank you",
      value === "helpful"
        ? "We are happy this answer helped."
        : "Thanks. We will improve this answer."
    );
  };

  const copyToClipboard = async (value, label) => {
    await Clipboard.setStringAsync(String(value));
    Alert.alert("Copied", `${label} copied successfully.`);
  };

  const handleEmailSupport = () => {
    openURL(
      `mailto:${supportInfo.email}?subject=YsStore Support Request`,
      "Unable to open email app."
    );
  };

  const handleCallSupport = () => {
    openURL(`tel:${supportInfo.phone}`, "Unable to open phone dialer.");
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent(
      "Hello YsStore Support, I need help with my account."
    );

    openURL(
      `https://wa.me/${supportInfo.whatsapp.replace("+", "")}?text=${message}`,
      "Unable to open WhatsApp."
    );
  };

  const handleVisitWebsite = () => {
    openURL(supportInfo.website, "Unable to open YsStore website.");
  };

  const handleShareHelp = async () => {
    try {
      await Share.share({
        message:
          "YsStore Help Center: Get support for orders, payments, wallet, delivery and account security.",
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share right now.");
    }
  };

  const closeTicketModal = () => {
    setTicketModal(false);
    setTicketSubject("");
    setTicketMessage("");
    setTicketCategory("Orders");
    setTicketPriority("Normal");
  };

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim()) {
      Alert.alert("Subject required", "Please enter the issue subject.");
      return;
    }

    if (!ticketMessage.trim() || ticketMessage.length < 10) {
      Alert.alert(
        "Message too short",
        "Please describe your issue with at least 10 characters."
      );
      return;
    }

    const ticketId = `YST-${Date.now().toString().slice(-6)}`;

    const newTicket = {
      id: ticketId,
      subject: ticketSubject.trim(),
      category: ticketCategory,
      priority: ticketPriority,
      message: ticketMessage.trim(),
      status: "Open",
      date: "Just now",
    };

    // Connect your backend API here:
    // await createSupportTicket(newTicket).unwrap();

    setTickets((prev) => [newTicket, ...prev]);
    closeTicketModal();

    Alert.alert(
      "Ticket Submitted",
      `Your support ticket ${ticketId} has been submitted successfully.`
    );
  };

  const openTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setTicketDetailsModal(true);
  };

  const closeTicketDetails = () => {
    setTicketDetailsModal(false);
    setSelectedTicket(null);
  };

  const updateTicketStatus = (ticketId, status) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status,
            }
          : ticket
      )
    );

    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            status,
          }
        : prev
    );

    Alert.alert("Updated", `Ticket marked as ${status}.`);
  };

  const deleteTicket = (ticketId) => {
    Alert.alert("Delete Ticket?", "This ticket will be removed from this device.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
          closeTicketDetails();
        },
      },
    ]);
  };

  const handleLiveChat = () => {
    Alert.alert(
      "Live Chat",
      "Connect this button to your Socket.IO support chat room or SupportChatScreen."
    );

    // Example:
    // router?.push("/SupportChatScreen");
  };

  const statusColor = (status) => {
    if (status === "Resolved") return COLORS.green;
    if (status === "Closed") return COLORS.muted;
    return COLORS.tomato;
  };

  const priorityColor = (priority) => {
    if (priority === "High") return COLORS.red;
    if (priority === "Low") return COLORS.green;
    return COLORS.yellow;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tomato} />

      <LinearGradient
        colors={[COLORS.tomato, COLORS.sky]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerIcon}
            onPress={() => navigation?.goBack?.()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Help Center</Text>
            <Text style={styles.headerSubtitle}>Support, FAQs and tickets</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerIcon}
            onPress={handleShareHelp}
          >
            <Ionicons name="share-social-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="headset-outline" size={34} color={COLORS.white} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>How can we help?</Text>
            <Text style={styles.heroText}>
              Search FAQs, submit a ticket, or contact support directly.
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.muted} />

          <TextInput
            placeholder="Search help, wallet, order, payment..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            style={styles.searchInput}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity activeOpacity={0.8} onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>

        {recentSearches.length > 0 && (
          <View style={styles.recentSearchBox}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent Searches</Text>

              <TouchableOpacity onPress={() => setRecentSearches([])}>
                <Text style={styles.clearRecentText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            >
              {recentSearches.map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.85}
                  style={styles.recentChip}
                  onPress={() => setSearch(item)}
                >
                  <Ionicons name="time-outline" size={14} color={COLORS.muted} />
                  <Text style={styles.recentChipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.quickSupportGrid}>
          <SupportCard
            title="Live Chat"
            desc="Chat with support"
            icon="chatbubble-ellipses-outline"
            color={COLORS.skyDark}
            bg="#e0f2fe"
            onPress={handleLiveChat}
          />

          <SupportCard
            title="Submit Ticket"
            desc="Create support case"
            icon="create-outline"
            color={COLORS.tomato}
            bg="#fff1ee"
            onPress={() => setTicketModal(true)}
          />

          <SupportCard
            title="My Tickets"
            desc={`${tickets.length} ticket${tickets.length === 1 ? "" : "s"}`}
            icon="file-tray-full-outline"
            color={COLORS.purple}
            bg="#ede9fe"
            onPress={() => setTicketsModal(true)}
          />

          <SupportCard
            title="WhatsApp"
            desc="Fast message help"
            icon="logo-whatsapp"
            color={COLORS.green}
            bg="#dcfce7"
            onPress={handleWhatsAppSupport}
          />
        </View>

        <View style={styles.emergencyCard}>
          <View style={styles.emergencyIcon}>
            <Ionicons name="alert-circle-outline" size={24} color={COLORS.red} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>Payment or wallet issue?</Text>
            <Text style={styles.emergencyText}>
              Send your order ID, transaction reference and payment date.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.emergencyBtn}
            onPress={() => {
              setTicketCategory("Payments");
              setTicketPriority("High");
              setTicketModal(true);
            }}
          >
            <Text style={styles.emergencyBtnText}>Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FAQ Categories</Text>
          <Text style={styles.sectionSubtitle}>Choose a topic to get quick answers</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const active = activeCategory === category;

            return (
              <TouchableOpacity
                key={category}
                activeOpacity={0.85}
                onPress={() => {
                  setActiveCategory(category);
                  setOpenedFaqId(null);
                }}
                style={[styles.categoryChip, active && styles.activeCategoryChip]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.activeCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Text style={styles.sectionSubtitle}>
            Tap a question to see the answer
          </Text>
        </View>

        {filteredFaqs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="help-circle-outline" size={45} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No FAQ found</Text>
            <Text style={styles.emptyText}>
              Try another keyword or submit a support ticket.
            </Text>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.emptyBtn}
              onPress={() => setTicketModal(true)}
            >
              <Text style={styles.emptyBtnText}>Submit Ticket</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredFaqs.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              opened={openedFaqId === faq.id}
              feedback={faqFeedback[faq.id]}
              onPress={() => handleFaqPress(faq.id)}
              onHelpful={() => handleFaqFeedback(faq.id, "helpful")}
              onNotHelpful={() => handleFaqFeedback(faq.id, "not-helpful")}
            />
          ))
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <Text style={styles.sectionSubtitle}>Other ways to get help</Text>
        </View>

        <View style={styles.moreSupportCard}>
          <MoreSupportRow
            icon="mail-outline"
            title="Email Support"
            desc={supportInfo.email}
            color={COLORS.tomato}
            onPress={handleEmailSupport}
            onCopy={() => copyToClipboard(supportInfo.email, "Support email")}
          />

          <MoreSupportRow
            icon="call-outline"
            title="Call Support"
            desc={supportInfo.phone}
            color={COLORS.purple}
            onPress={handleCallSupport}
            onCopy={() => copyToClipboard(supportInfo.phone, "Support phone")}
          />

          <MoreSupportRow
            icon="globe-outline"
            title="Visit Website"
            desc="Open ysstoreapp.com"
            color={COLORS.skyDark}
            onPress={handleVisitWebsite}
          />

          <MoreSupportRow
            icon="document-text-outline"
            title="Terms and Policies"
            desc="Read privacy, refund and usage policies"
            color={COLORS.dark}
            onPress={() =>
              Alert.alert(
                "Policies",
                "Connect this to your Privacy Policy or Terms screen."
              )
            }
          />
        </View>

        <View style={styles.versionBox}>
          <MaterialCommunityIcons
            name="store-check-outline"
            size={24}
            color={COLORS.tomato}
          />
          <Text style={styles.versionText}>YsStore Support Center v1.0</Text>
        </View>

        <View style={{ height: 35 }} />
      </ScrollView>

      <ActionModal
        visible={ticketModal}
        title="Submit Support Ticket"
        subtitle="Tell us the issue you are facing"
        onClose={closeTicketModal}
      >
        <InputField
          label="Subject"
          placeholder="Example: Payment deducted but order not updated"
          value={ticketSubject}
          onChangeText={setTicketSubject}
        />

        <Text style={styles.inputLabel}>Category</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ticketCategoryList}
        >
          {categories
            .filter((item) => item !== "All")
            .map((item) => {
              const active = ticketCategory === item;

              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.85}
                  onPress={() => setTicketCategory(item)}
                  style={[
                    styles.ticketCategoryChip,
                    active && styles.activeTicketCategoryChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.ticketCategoryText,
                      active && styles.activeTicketCategoryText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>

        <Text style={styles.inputLabel}>Priority</Text>

        <View style={styles.priorityRow}>
          {["Low", "Normal", "High"].map((priority) => {
            const active = ticketPriority === priority;

            return (
              <TouchableOpacity
                key={priority}
                activeOpacity={0.85}
                style={[
                  styles.priorityChip,
                  active && {
                    backgroundColor: `${priorityColor(priority)}18`,
                    borderColor: priorityColor(priority),
                  },
                ]}
                onPress={() => setTicketPriority(priority)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    active && { color: priorityColor(priority) },
                  ]}
                >
                  {priority}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Message</Text>
          <TextInput
            placeholder="Describe your issue clearly..."
            placeholderTextColor="#94a3b8"
            style={[styles.modalInput, styles.textArea]}
            value={ticketMessage}
            onChangeText={setTicketMessage}
            multiline
            textAlignVertical="top"
          />
        </View>

        <PrimaryButton title="Submit Ticket" onPress={handleSubmitTicket} />
      </ActionModal>

      <ActionModal
        visible={ticketsModal}
        title="My Support Tickets"
        subtitle="Track your submitted support requests"
        onClose={() => setTicketsModal(false)}
      >
        {tickets.length === 0 ? (
          <View style={styles.ticketEmptyBox}>
            <Ionicons name="file-tray-outline" size={42} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No tickets yet</Text>
            <Text style={styles.emptyText}>
              Your submitted support tickets will appear here.
            </Text>
          </View>
        ) : (
          tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              activeOpacity={0.86}
              style={styles.ticketCard}
              onPress={() => openTicketDetails(ticket)}
            >
              <View style={styles.ticketTop}>
                <Text style={styles.ticketId}>{ticket.id}</Text>

                <View
                  style={[
                    styles.ticketStatusBadge,
                    { backgroundColor: `${statusColor(ticket.status)}15` },
                  ]}
                >
                  <Text
                    style={[
                      styles.ticketStatusText,
                      { color: statusColor(ticket.status) },
                    ]}
                  >
                    {ticket.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.ticketSubject} numberOfLines={1}>
                {ticket.subject}
              </Text>

              <Text style={styles.ticketMeta}>
                {ticket.category} • {ticket.priority} • {ticket.date}
              </Text>
            </TouchableOpacity>
          ))
        )}

        <PrimaryButton
          title="Create New Ticket"
          onPress={() => {
            setTicketsModal(false);
            setTicketModal(true);
          }}
        />
      </ActionModal>

      <ActionModal
        visible={ticketDetailsModal}
        title="Ticket Details"
        subtitle="Support ticket information"
        onClose={closeTicketDetails}
      >
        {selectedTicket && (
          <>
            <DetailRow label="Ticket ID" value={selectedTicket.id} />
            <DetailRow label="Subject" value={selectedTicket.subject} />
            <DetailRow label="Category" value={selectedTicket.category} />
            <DetailRow label="Priority" value={selectedTicket.priority} />
            <DetailRow label="Status" value={selectedTicket.status} />
            <DetailRow label="Date" value={selectedTicket.date} />
            <DetailRow label="Message" value={selectedTicket.message} />

            <View style={styles.ticketActionRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.smallActionBtn}
                onPress={() => copyToClipboard(selectedTicket.id, "Ticket ID")}
              >
                <Ionicons name="copy-outline" size={17} color={COLORS.skyDark} />
                <Text style={styles.smallActionText}>Copy ID</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.smallActionBtn}
                onPress={() => updateTicketStatus(selectedTicket.id, "Resolved")}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={17}
                  color={COLORS.green}
                />
                <Text style={[styles.smallActionText, { color: COLORS.green }]}>
                  Resolve
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.deleteTicketBtn}
              onPress={() => deleteTicket(selectedTicket.id)}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.red} />
              <Text style={styles.deleteTicketText}>Delete Ticket</Text>
            </TouchableOpacity>
          </>
        )}
      </ActionModal>
    </View>
  );
};

const SupportCard = ({ title, desc, icon, color, bg, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.supportCard} onPress={onPress}>
      <View style={[styles.supportIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={25} color={color} />
      </View>

      <Text style={styles.supportTitle}>{title}</Text>
      <Text style={styles.supportDesc}>{desc}</Text>
    </TouchableOpacity>
  );
};

const FAQItem = ({
  faq,
  opened,
  feedback,
  onPress,
  onHelpful,
  onNotHelpful,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.faqCard} onPress={onPress}>
      <View style={styles.faqTop}>
        <View style={styles.faqLeft}>
          <View style={styles.faqIcon}>
            <Ionicons name="help-circle-outline" size={21} color={COLORS.skyDark} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.faqCategory}>{faq.category}</Text>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
          </View>
        </View>

        <Ionicons
          name={opened ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.muted}
        />
      </View>

      {opened && (
        <View style={styles.faqAnswerBox}>
          <Text style={styles.faqAnswer}>{faq.answer}</Text>

          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>Was this helpful?</Text>

            <View style={styles.feedbackActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.feedbackBtn,
                  feedback === "helpful" && styles.feedbackActiveYes,
                ]}
                onPress={onHelpful}
              >
                <Ionicons
                  name="thumbs-up-outline"
                  size={15}
                  color={feedback === "helpful" ? COLORS.green : COLORS.muted}
                />
                <Text
                  style={[
                    styles.feedbackBtnText,
                    feedback === "helpful" && { color: COLORS.green },
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.feedbackBtn,
                  feedback === "not-helpful" && styles.feedbackActiveNo,
                ]}
                onPress={onNotHelpful}
              >
                <Ionicons
                  name="thumbs-down-outline"
                  size={15}
                  color={feedback === "not-helpful" ? COLORS.red : COLORS.muted}
                />
                <Text
                  style={[
                    styles.feedbackBtnText,
                    feedback === "not-helpful" && { color: COLORS.red },
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const MoreSupportRow = ({ icon, title, desc, color, onPress, onCopy }) => {
  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.moreSupportRow} onPress={onPress}>
      <View style={[styles.moreSupportIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.moreSupportTitle}>{title}</Text>
        <Text style={styles.moreSupportDesc}>{desc}</Text>
      </View>

      {onCopy ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.copyMiniBtn}
          onPress={onCopy}
        >
          <Ionicons name="copy-outline" size={17} color={COLORS.tomato} />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
      )}
    </TouchableOpacity>
  );
};

const ActionModal = ({ visible, title, subtitle, children, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>{subtitle}</Text>
            </View>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const InputField = ({ label, ...props }) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        placeholderTextColor="#94a3b8"
        style={styles.modalInput}
        {...props}
      />
    </View>
  );
};

const PrimaryButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.primaryButton} onPress={onPress}>
      <LinearGradient
        colors={[COLORS.tomato, COLORS.sky]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryGradient}
      >
        <Text style={styles.primaryButtonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const DetailRow = ({ label, value }) => {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

export default HelpCenterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  topGradient: {
    paddingTop: Platform.OS === "android" ? 30 : 46,
    paddingHorizontal: 16,
    paddingBottom: 58,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleBox: {
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.white,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 11.5,
    fontWeight: "600",
    color: "rgba(255,255,255,0.82)",
  },

  heroCard: {
    marginTop: 18,
    borderRadius: 25,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.white,
  },

  heroText: {
    marginTop: 5,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.84)",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  searchBox: {
    // marginTop: -44,
    height: 54,
    backgroundColor: COLORS.white,
    borderRadius: 19,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.dark,
  },

  quickSupportGrid: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  supportCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 23,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  supportTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.dark,
  },

  supportDesc: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },

  emergencyCard: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 23,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },

  emergencyIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: COLORS.redSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emergencyTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.dark,
  },

  emergencyText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    color: COLORS.muted,
  },

  emergencyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.redSoft,
  },

  emergencyBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.red,
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.dark,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.muted,
  },

  categoryList: {
    gap: 10,
  },

  categoryChip: {
    paddingHorizontal: 17,
    paddingVertical: 10,
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
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.muted,
  },

  activeCategoryText: {
    color: COLORS.white,
  },

  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 23,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  faqTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  faqLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  faqIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.skySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  faqCategory: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.tomato,
    marginBottom: 3,
  },

  faqQuestion: {
    fontSize: 14.3,
    fontWeight: "900",
    color: COLORS.dark,
  },

  faqAnswerBox: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },

  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.muted,
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: "900",
  },

  emptyText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "600",
    textAlign: "center",
  },

  emptyBtn: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: COLORS.tomato,
  },

  emptyBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.white,
  },

  moreSupportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  moreSupportRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  moreSupportIcon: {
    width: 46,
    height: 46,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  moreSupportTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.dark,
  },

  moreSupportDesc: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },

  versionBox: {
    marginTop: 24,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  versionText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.dark,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.45)",
  },

  modalBackdrop: {
    flex: 1,
  },

  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 35 : 24,
    maxHeight: "88%",
  },

  modalHandle: {
    width: 45,
    height: 5,
    borderRadius: 20,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 18,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 12,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.dark,
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
  },

  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  inputGroup: {
    marginBottom: 14,
  },

  inputLabel: {
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.dark,
  },

  modalInput: {
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.dark,
  },

  textArea: {
    height: 120,
    paddingTop: 14,
  },

  ticketCategoryList: {
    gap: 10,
    paddingBottom: 14,
  },

  ticketCategoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  activeTicketCategoryChip: {
    backgroundColor: COLORS.skySoft,
    borderColor: COLORS.sky,
  },

  ticketCategoryText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.muted,
  },

  activeTicketCategoryText: {
    color: COLORS.skyDark,
  },

  primaryButton: {
    marginTop: 8,
    borderRadius: 18,
    overflow: "hidden",
  },

  primaryGradient: {
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.white,
  },
});