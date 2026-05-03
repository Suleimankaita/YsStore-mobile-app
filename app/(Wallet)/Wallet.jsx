import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";

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
  purple: "#8b5cf6",
  red: "#ef4444",
};

const initialWalletData = {
  availableBalance: 245700,
  pendingBalance: 18500,
  totalReceived: 480000,
  totalWithdrawn: 234300,
  walletId: "YSW-2048-9932",
  accountNumber: "9087654321",
  bankName: "YsStore Wallet Bank",
  accountName: "Suleiman Yusuf",
};

const initialTransactions = [
  {
    id: "1",
    type: "credit",
    title: "Order Payment Received",
    desc: "Payment from customer order #YS-2041",
    amount: 45000,
    status: "Successful",
    date: "Today, 10:45 AM",
    icon: "arrow-down-circle",
    reference: "YS-TXN-10001",
  },
  {
    id: "2",
    type: "debit",
    title: "Withdrawal",
    desc: "Transfer to bank account",
    amount: 30000,
    status: "Successful",
    date: "Yesterday, 5:20 PM",
    icon: "arrow-up-circle",
    reference: "YS-TXN-10002",
  },
  {
    id: "3",
    type: "pending",
    title: "Pending Delivery Payment",
    desc: "Funds will be released after buyer confirms delivery",
    amount: 18500,
    status: "Pending",
    date: "Apr 30, 2026",
    icon: "clock-outline",
    reference: "YS-TXN-10003",
  },
  {
    id: "4",
    type: "credit",
    title: "Wallet Top Up",
    desc: "Manual wallet funding",
    amount: 60000,
    status: "Successful",
    date: "Apr 29, 2026",
    icon: "wallet-plus",
    reference: "YS-TXN-10004",
  },
  {
    id: "5",
    type: "debit",
    title: "Service Charge",
    desc: "Marketplace commission fee",
    amount: 2500,
    status: "Successful",
    date: "Apr 28, 2026",
    icon: "cash-minus",
    reference: "YS-TXN-10005",
  },
];

const formatMoney = (amount) => {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
};

const cleanAmount = (value) => {
  return value.replace(/[^0-9]/g, "");
};

const WalletScreen = ({ navigation }) => {
  const [walletData, setWalletData] = useState(initialWalletData);
  const [transactions, setTransactions] = useState(initialTransactions);

  const [showBalance, setShowBalance] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [topUpAmount, setTopUpAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBank, setWithdrawBank] = useState("");
  const [withdrawAccount, setWithdrawAccount] = useState("");

  const [transferAmount, setTransferAmount] = useState("");
  const [transferWalletId, setTransferWalletId] = useState("");

  const filters = ["All", "Credit", "Debit", "Pending"];

  const filteredTransactions = useMemo(() => {
    let data = transactions;

    if (activeFilter !== "All") {
      data = data.filter(
        (item) => item.type.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.reference.toLowerCase().includes(q)
      );
    }

    return data;
  }, [activeFilter, search, transactions]);

  const getTransactionColor = (type) => {
    if (type === "credit") return COLORS.green;
    if (type === "debit") return COLORS.red;
    return COLORS.yellow;
  };

  const handleCopy = async (value, label) => {
    await Clipboard.setStringAsync(String(value));
    Alert.alert("Copied", `${label} copied successfully.`);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Replace this with your real API refetch later.
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert("Updated", "Wallet refreshed successfully.");
    }, 800);
  }, []);

  const closeModal = () => {
    setActiveModal(null);
    setSelectedTransaction(null);
  };

  const createTransaction = ({ type, title, desc, amount, status = "Successful" }) => {
    const colorIcon =
      type === "credit"
        ? "arrow-down-circle"
        : type === "debit"
        ? "arrow-up-circle"
        : "clock-outline";

    const newTransaction = {
      id: String(Date.now()),
      type,
      title,
      desc,
      amount: Number(amount),
      status,
      date: "Just now",
      icon: colorIcon,
      reference: `YS-TXN-${Date.now()}`,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleTopUp = () => {
    const amount = Number(topUpAmount);

    if (!amount || amount < 100) {
      Alert.alert("Invalid amount", "Enter an amount from ₦100 and above.");
      return;
    }

    // Connect Paystack/Monnify top-up API here.
    setWalletData((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance + amount,
      totalReceived: prev.totalReceived + amount,
    }));

    createTransaction({
      type: "credit",
      title: "Wallet Top Up",
      desc: "Manual wallet funding",
      amount,
    });

    setTopUpAmount("");
    closeModal();
    Alert.alert("Successful", `${formatMoney(amount)} added to wallet.`);
  };

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);

    if (!amount || amount < 500) {
      Alert.alert("Invalid amount", "Minimum withdrawal is ₦500.");
      return;
    }

    if (amount > walletData.availableBalance) {
      Alert.alert("Insufficient balance", "You do not have enough available balance.");
      return;
    }

    if (!withdrawBank.trim()) {
      Alert.alert("Bank required", "Enter your bank name.");
      return;
    }

    if (!withdrawAccount.trim() || withdrawAccount.length < 10) {
      Alert.alert("Invalid account", "Enter a valid account number.");
      return;
    }

    // Connect withdrawal API here.
    setWalletData((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - amount,
      totalWithdrawn: prev.totalWithdrawn + amount,
    }));

    createTransaction({
      type: "debit",
      title: "Withdrawal",
      desc: `Transfer to ${withdrawBank}`,
      amount,
    });

    setWithdrawAmount("");
    setWithdrawBank("");
    setWithdrawAccount("");
    closeModal();
    Alert.alert("Withdrawal sent", `${formatMoney(amount)} withdrawal requested.`);
  };

  const handleTransfer = () => {
    const amount = Number(transferAmount);

    if (!transferWalletId.trim()) {
      Alert.alert("Wallet ID required", "Enter receiver wallet ID.");
      return;
    }

    if (!amount || amount < 100) {
      Alert.alert("Invalid amount", "Minimum transfer is ₦100.");
      return;
    }

    if (amount > walletData.availableBalance) {
      Alert.alert("Insufficient balance", "You do not have enough available balance.");
      return;
    }

    // Connect wallet-to-wallet transfer API here.
    setWalletData((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - amount,
    }));

    createTransaction({
      type: "debit",
      title: "Wallet Transfer",
      desc: `Transfer to ${transferWalletId}`,
      amount,
    });

    setTransferAmount("");
    setTransferWalletId("");
    closeModal();
    Alert.alert("Transfer successful", `${formatMoney(amount)} transferred.`);
  };

  const handleShareStatement = async () => {
    const message = `YsStore Wallet Statement

Available Balance: ${formatMoney(walletData.availableBalance)}
Pending Balance: ${formatMoney(walletData.pendingBalance)}
Total Received: ${formatMoney(walletData.totalReceived)}
Total Withdrawn: ${formatMoney(walletData.totalWithdrawn)}
Wallet ID: ${walletData.walletId}`;

    await Share.share({ message });
  };

  const openTransactionDetails = (item) => {
    setSelectedTransaction(item);
    setActiveModal("transaction");
  };

  const renderTransaction = ({ item }) => {
    const color = getTransactionColor(item.type);
    const isDebit = item.type === "debit";
    const sign = isDebit ? "-" : "+";

    return (
      <TouchableOpacity
        activeOpacity={0.86}
        style={styles.transactionCard}
        onPress={() => openTransactionDetails(item)}
      >
        <View style={[styles.transactionIconBox, { backgroundColor: `${color}15` }]}>
          <MaterialCommunityIcons name={item.icon} size={25} color={color} />
        </View>

        <View style={styles.transactionContent}>
          <View style={styles.transactionTitleRow}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {item.title}
            </Text>

            <Text style={[styles.transactionAmount, { color }]}>
              {sign}
              {formatMoney(item.amount)}
            </Text>
          </View>

          <Text style={styles.transactionDesc} numberOfLines={1}>
            {item.desc}
          </Text>

          <View style={styles.transactionBottom}>
            <Text style={styles.transactionDate}>{item.date}</Text>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === "Pending" ? "#fef3c7" : "#dcfce7",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: item.status === "Pending" ? "#b45309" : "#15803d",
                  },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
            <Text style={styles.headerTitle}>Wallet</Text>
            <Text style={styles.headerSubtitle}>Payments, balance & history</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                {showBalance
                  ? formatMoney(walletData.availableBalance)
                  : "₦••••••••"}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowBalance((prev) => !prev)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showBalance ? "eye-outline" : "eye-off-outline"}
                size={21}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceBottomRow}>
            <View>
              <Text style={styles.miniLabel}>Pending Release</Text>
              <Text style={styles.miniValue}>
                {showBalance ? formatMoney(walletData.pendingBalance) : "₦••••"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.walletIdBox}
              activeOpacity={0.8}
              onPress={() => handleCopy(walletData.walletId, "Wallet ID")}
            >
              <Text style={styles.miniLabel}>Wallet ID</Text>
              <View style={styles.walletIdRow}>
                <Text style={styles.walletId}>{walletData.walletId}</Text>
                <Feather name="copy" size={14} color={COLORS.white} />
              </View>
            </TouchableOpacity>
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
        <View style={styles.quickActions}>
          <QuickAction
            title="Top Up"
            icon="add-circle-outline"
            color={COLORS.skyDark}
            onPress={() => setActiveModal("topup")}
          />
          <QuickAction
            title="Withdraw"
            icon="arrow-up-circle-outline"
            color={COLORS.tomatoDark}
            onPress={() => setActiveModal("withdraw")}
          />
          <QuickAction
            title="Transfer"
            icon="swap-horizontal-outline"
            color={COLORS.purple}
            onPress={() => setActiveModal("transfer")}
          />
          <QuickAction
            title="Statement"
            icon="document-text-outline"
            color={COLORS.green}
            onPress={handleShareStatement}
          />
        </View>

        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={COLORS.skyDark}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Protected wallet system</Text>
            <Text style={styles.noticeText}>
              Order payments can stay pending until the buyer confirms delivery.
            </Text>
          </View>
        </View>

        <View style={styles.virtualAccountCard}>
          <View style={styles.virtualTop}>
            <View>
              <Text style={styles.cardSmallTitle}>Virtual Account</Text>
              <Text style={styles.accountNumber}>{walletData.accountNumber}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.copyBtn}
              onPress={() =>
                handleCopy(walletData.accountNumber, "Account number")
              }
            >
              <Feather name="copy" size={16} color={COLORS.tomato} />
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.accountInfoRow}>
            <Text style={styles.accountInfoLabel}>Bank</Text>
            <Text style={styles.accountInfoValue}>{walletData.bankName}</Text>
          </View>

          <View style={styles.accountInfoRow}>
            <Text style={styles.accountInfoLabel}>Account Name</Text>
            <Text style={styles.accountInfoValue}>{walletData.accountName}</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            title="Received"
            value={formatMoney(walletData.totalReceived)}
            icon="trending-up-outline"
            color={COLORS.green}
          />
          <SummaryCard
            title="Withdrawn"
            value={formatMoney(walletData.totalWithdrawn)}
            icon="trending-down-outline"
            color={COLORS.red}
          />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <Text style={styles.sectionSubtitle}>Track every wallet movement</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setActiveFilter("All");
              setSearch("");
            }}
          >
            <Text style={styles.seeAll}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.muted} />
          <TextInput
            placeholder="Search transaction..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {filters.map((filter) => {
            const active = activeFilter === filter;

            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.85}
                onPress={() => setActiveFilter(filter)}
                style={[styles.filterBtn, active && styles.activeFilterBtn]}
              >
                <Text style={[styles.filterText, active && styles.activeFilterText]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={42} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No transaction found</Text>
              <Text style={styles.emptySubtitle}>
                Try another filter or search keyword.
              </Text>
            </View>
          }
        />

        <View style={{ height: 35 }} />
      </ScrollView>

      <ActionModal
        visible={activeModal === "topup"}
        title="Top Up Wallet"
        subtitle="Add money to your YsStore wallet"
        onClose={closeModal}
      >
        <InputField
          label="Amount"
          placeholder="Enter amount"
          keyboardType="numeric"
          value={topUpAmount}
          onChangeText={(value) => setTopUpAmount(cleanAmount(value))}
        />

        <PrimaryButton title="Continue Top Up" onPress={handleTopUp} />
      </ActionModal>

      <ActionModal
        visible={activeModal === "withdraw"}
        title="Withdraw Money"
        subtitle="Send money from wallet to bank"
        onClose={closeModal}
      >
        <InputField
          label="Amount"
          placeholder="Enter amount"
          keyboardType="numeric"
          value={withdrawAmount}
          onChangeText={(value) => setWithdrawAmount(cleanAmount(value))}
        />

        <InputField
          label="Bank Name"
          placeholder="Example: Access Bank"
          value={withdrawBank}
          onChangeText={setWithdrawBank}
        />

        <InputField
          label="Account Number"
          placeholder="Enter account number"
          keyboardType="numeric"
          value={withdrawAccount}
          onChangeText={(value) => setWithdrawAccount(cleanAmount(value))}
        />

        <PrimaryButton title="Request Withdrawal" onPress={handleWithdraw} />
      </ActionModal>

      <ActionModal
        visible={activeModal === "transfer"}
        title="Transfer Money"
        subtitle="Send money to another YsStore wallet"
        onClose={closeModal}
      >
        <InputField
          label="Receiver Wallet ID"
          placeholder="Example: YSW-2048-9932"
          value={transferWalletId}
          onChangeText={setTransferWalletId}
        />

        <InputField
          label="Amount"
          placeholder="Enter amount"
          keyboardType="numeric"
          value={transferAmount}
          onChangeText={(value) => setTransferAmount(cleanAmount(value))}
        />

        <PrimaryButton title="Send Transfer" onPress={handleTransfer} />
      </ActionModal>

      <ActionModal
        visible={activeModal === "transaction"}
        title="Transaction Details"
        subtitle="Full wallet transaction information"
        onClose={closeModal}
      >
        {selectedTransaction && (
          <>
            <DetailRow label="Title" value={selectedTransaction.title} />
            <DetailRow label="Amount" value={formatMoney(selectedTransaction.amount)} />
            <DetailRow label="Type" value={selectedTransaction.type.toUpperCase()} />
            <DetailRow label="Status" value={selectedTransaction.status} />
            <DetailRow label="Date" value={selectedTransaction.date} />
            <DetailRow label="Reference" value={selectedTransaction.reference} />
            <DetailRow label="Description" value={selectedTransaction.desc} />

            <PrimaryButton
              title="Copy Reference"
              onPress={() =>
                handleCopy(selectedTransaction.reference, "Transaction reference")
              }
            />
          </>
        )}
      </ActionModal>
    </View>
  );
};

const QuickAction = ({ title, icon, color, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.quickActionBtn} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={25} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );
};

const SummaryCard = ({ title, value, icon, color }) => {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>

      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

const ActionModal = ({ visible, title, subtitle, children, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>{subtitle}</Text>
            </View>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          {children}
        </View>
      </View>
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
    <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={onPress}>
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

export default WalletScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  topGradient: {
    paddingTop: Platform.OS === "android" ? 30 : 46,
    paddingHorizontal: 16,
    paddingBottom: 62,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    width: 7,
    height: 7,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    position: "absolute",
    top: 10,
    right: 11,
  },

  headerTitleBox: {
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.white,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.82)",
  },

  balanceCard: {
    marginTop: 14,
    borderRadius: 22,
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  balanceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  balanceLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.82)",
  },

  balanceAmount: {
    marginTop: 5,
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: -0.6,
  },

  eyeButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  balanceDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 12,
  },

  balanceBottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  miniLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "rgba(255,255,255,0.72)",
  },

  miniValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.white,
  },

  walletIdBox: {
    alignItems: "flex-end",
  },

  walletIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },

  walletId: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  quickActions: {
    marginTop: -50,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  quickActionBtn: {
    flex: 1,
    alignItems: "center",
  },

  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  quickActionText: {
    fontSize: 11.5,
    fontWeight: "900",
    color: COLORS.dark,
  },

  noticeCard: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },

  noticeIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },

  noticeTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.dark,
  },

  noticeText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.muted,
    fontWeight: "600",
  },

  virtualAccountCard: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 17,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  virtualTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardSmallTitle: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: "800",
  },

  accountNumber: {
    marginTop: 4,
    fontSize: 24,
    color: COLORS.dark,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  copyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fff1ee",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  copyText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.tomato,
  },

  accountInfoRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },

  accountInfoLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
  },

  accountInfoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.dark,
  },

  summaryGrid: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 23,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  summaryTitle: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "800",
  },

  summaryValue: {
    marginTop: 5,
    fontSize: 17,
    color: COLORS.dark,
    fontWeight: "900",
  },

  sectionHeader: {
    marginTop: 26,
    marginBottom: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  sectionTitle: {
    fontSize: 22,
    color: COLORS.dark,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: "600",
  },

  seeAll: {
    fontSize: 13,
    color: COLORS.tomato,
    fontWeight: "900",
  },

  searchBox: {
    height: 52,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.dark,
  },

  filterList: {
    gap: 10,
    paddingVertical: 14,
  },

  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  activeFilterBtn: {
    backgroundColor: COLORS.tomato,
    borderColor: COLORS.tomato,
  },

  filterText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.muted,
  },

  activeFilterText: {
    color: COLORS.white,
  },

  transactionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  transactionIconBox: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  transactionContent: {
    flex: 1,
  },

  transactionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  transactionTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.dark,
  },

  transactionAmount: {
    fontSize: 13.5,
    fontWeight: "900",
  },

  transactionDesc: {
    marginTop: 4,
    fontSize: 12.2,
    color: COLORS.muted,
    fontWeight: "600",
  },

  transactionBottom: {
    marginTop: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  transactionDate: {
    fontSize: 11.5,
    color: "#94a3b8",
    fontWeight: "700",
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    color: COLORS.dark,
    fontWeight: "900",
  },

  emptySubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "600",
    textAlign: "center",
  },
});