import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Pressable,
  Modal,
  Alert,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { DatePicker } from "@/components/date-picker";
import { PhotoPickerButton } from "@/components/photo-picker-button";
import { ReceiptPhotoDisplay } from "@/components/receipt-photo-display";
import { useState, useEffect, useMemo } from "react";

export default function EditTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, categories, updateTransaction } = useTransactions();

  const transaction = useMemo(() => {
    return transactions.find((t) => t.id === id);
  }, [transactions, id]);

  const [type, setType] = useState<"income" | "expense">(transaction?.type || "expense");
  const [amount, setAmount] = useState(transaction?.amount.toString() || "");
  const [selectedCategory, setSelectedCategory] = useState(transaction?.category || "");
  const [date, setDate] = useState(transaction?.date ? new Date(transaction.date) : new Date());
  const [description, setDescription] = useState(transaction?.description || "");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>(transaction?.photoUri);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === type || c.type === "both");
  }, [categories, type]);

  const selectedCategoryObj = useMemo(() => {
    return categories.find((c) => c.id === selectedCategory);
  }, [categories, selectedCategory]);

  if (!transaction) {
    return (
      <ScreenContainer className="p-4 items-center justify-center">
        <Text className="text-foreground">Transaction not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary px-6 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const handleSave = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      await updateTransaction(id!, {
        type,
        amount: parsedAmount,
        category: selectedCategory,
        date,
        description,
        photoUri,
      });

      Alert.alert("Success", "Transaction updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update transaction");
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(num);
  };

  const formatDate = (d: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Edit Transaction</Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-lg text-muted">✕</Text>
          </Pressable>
        </View>

        {/* Type Toggle */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-2">Transaction Type</Text>
          <View className="flex-row gap-2">
            {(["income", "expense"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => {
                  setType(t);
                  setSelectedCategory("");
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="flex-1"
              >
                <View
                  className={`py-3 px-4 rounded-lg border ${
                    type === t
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold text-center ${
                      type === t ? "text-white" : "text-foreground"
                    }`}
                  >
                    {t === "income" ? "💰 Income" : "💸 Expense"}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Amount Input */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-2">Amount (₹)</Text>
          <TextInput
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground text-lg"
            placeholderTextColor="#9BA1A6"
          />
          {amount && (
            <Text className="text-xs text-muted mt-2">
              {formatCurrency(amount)}
            </Text>
          )}
        </View>

        {/* Category Selection */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-2">Category</Text>
          <Pressable
            onPress={() => setShowCategoryModal(true)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View className="bg-surface border border-border rounded-lg px-4 py-3 flex-row items-center justify-between">
              {selectedCategoryObj ? (
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg">{selectedCategoryObj.icon}</Text>
                  <Text className="text-foreground font-medium">{selectedCategoryObj.name}</Text>
                </View>
              ) : (
                <Text className="text-muted">Select a category</Text>
              )}
              <Text className="text-muted">›</Text>
            </View>
          </Pressable>
        </View>

        {/* Date Picker */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-2">Date</Text>
          <DatePicker selectedDate={date} onDateChange={setDate} maxDaysInPast={365} />
        </View>

        {/* Description Input */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-2">Description (Optional)</Text>
          <TextInput
            placeholder="Add notes about this transaction"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            placeholderTextColor="#9BA1A6"
          />
        </View>

        {/* Receipt Photo Section */}
        {!photoUri ? (
          <PhotoPickerButton
            onPhotoSelected={setPhotoUri}
            label="Add Receipt Photo (Optional)"
            icon="📸"
          />
        ) : (
          <ReceiptPhotoDisplay
            photoUri={photoUri}
            editable
            onRemove={() => setPhotoUri(undefined)}
            onReplace={() => {
              setPhotoUri(undefined);
            }}
          />
        )}

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          className="bg-primary py-4 rounded-lg items-center mb-3 mt-6"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-lg">Save Changes</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-surface border border-border py-4 rounded-lg items-center"
          activeOpacity={0.8}
        >
          <Text className="text-foreground font-semibold">Cancel</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-4 max-h-2/3">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Select Category</Text>
              <Pressable onPress={() => setShowCategoryModal(false)}>
                <Text className="text-lg text-muted">✕</Text>
              </Pressable>
            </View>

            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedCategory(item.id);
                    setShowCategoryModal(false);
                  }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View
                    className={`flex-row items-center gap-3 p-4 rounded-lg border mb-2 ${
                      selectedCategory === item.id
                        ? "bg-primary border-primary"
                        : "bg-surface border-border"
                    }`}
                  >
                    <Text className="text-2xl">{item.icon}</Text>
                    <Text
                      className={`font-medium flex-1 ${
                        selectedCategory === item.id ? "text-white" : "text-foreground"
                      }`}
                    >
                      {item.name}
                    </Text>
                    {selectedCategory === item.id && (
                      <Text className="text-white font-bold">✓</Text>
                    )}
                  </View>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
