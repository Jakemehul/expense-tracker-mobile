import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Pressable,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { DEFAULT_CATEGORIES } from "@/lib/types";
import { DatePicker } from "@/components/date-picker";
import { PhotoPickerButton } from "@/components/photo-picker-button";
import { ReceiptPhotoDisplay } from "@/components/receipt-photo-display";
import { UPIPaymentModal, type UPIPaymentData } from "@/components/upi-payment-modal";
import { useState } from "react";

export default function AddTransactionScreen() {
  const router = useRouter();
  const { addTransaction, categories } = useTransactions();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [showUPIModal, setShowUPIModal] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type || c.type === "both");

  const handleAddTransaction = async () => {
    if (!amount || !selectedCategory) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    try {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        category: selectedCategory,
        date,
        description,
        photoUri,
      });
      router.back();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction");
    }
  };

  const formatDate = (d: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  };

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);

  const handleUPIPaymentInitiated = (upiData: UPIPaymentData) => {
    // Pre-fill the form with UPI payment data
    setType(upiData.type);
    setAmount(upiData.amount);
    setDescription(upiData.notes || `Payment to ${upiData.upiId}`);
    setShowUPIModal(false);
    // User will now select category manually
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Add Transaction</Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setShowUPIModal(true)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View className="bg-primary/10 border border-primary rounded-lg px-3 py-2">
                <Text className="text-lg">💳</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => router.back()}>
              <Text className="text-lg text-muted">✕</Text>
            </Pressable>
          </View>
        </View>

        {/* Transaction Type Toggle */}
        <View className="mb-6 flex-row gap-3">
          <Pressable
            onPress={() => {
              setType("expense");
              setSelectedCategory("");
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View
              className={`flex-1 py-3 px-4 rounded-lg border ${
                type === "expense"
                  ? "bg-red-500 border-red-500"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold text-base ${
                  type === "expense" ? "text-white" : "text-foreground"
                }`}
              >
                💸 Expense
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              setType("income");
              setSelectedCategory("");
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View
              className={`flex-1 py-3 px-4 rounded-lg border ${
                type === "income"
                  ? "bg-green-500 border-green-500"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold text-base ${
                  type === "income" ? "text-white" : "text-foreground"
                }`}
              >
                💰 Income
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Amount Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Amount (₹)</Text>
          <TextInput
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground text-lg"
            placeholderTextColor="#9BA1A6"
          />
        </View>

        {/* Category Selector */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Category</Text>
          <Pressable
            onPress={() => setShowCategoryPicker(true)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View className="bg-surface border border-border rounded-lg px-4 py-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                {selectedCategoryObj ? (
                  <>
                    <Text className="text-lg">{selectedCategoryObj.icon}</Text>
                    <Text className="text-foreground font-medium">{selectedCategoryObj.name}</Text>
                  </>
                ) : (
                  <Text className="text-muted">Select a category</Text>
                )}
              </View>
              <Text className="text-muted">▼</Text>
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
            placeholder="Add a note..."
            value={description}
            onChangeText={setDescription}
            className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            placeholderTextColor="#9BA1A6"
            multiline
            numberOfLines={3}
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
              // User can tap again to add new photo
            }}
          />
        )}

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleAddTransaction}
          className="bg-primary py-4 rounded-lg items-center mb-4 mt-6"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-lg">Save Transaction</Text>
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

      {/* UPI Payment Modal */}
      <UPIPaymentModal
        visible={showUPIModal}
        onClose={() => setShowUPIModal(false)}
        onPaymentInitiated={handleUPIPaymentInitiated}
      />

      {/* Category Picker Modal */}
      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Select Category</Text>
              <Pressable onPress={() => setShowCategoryPicker(false)}>
                <Text className="text-lg text-muted">✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {filteredCategories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setShowCategoryPicker(false);
                  }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View className="flex-row items-center gap-3 bg-surface rounded-lg p-4 mb-2 border border-border">
                    <Text className="text-2xl">{category.icon}</Text>
                    <Text className="text-foreground font-medium flex-1">{category.name}</Text>
                    {selectedCategory === category.id && (
                      <Text className="text-primary font-bold">✓</Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
