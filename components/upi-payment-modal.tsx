import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { cn } from "@/lib/utils";

export interface UPIPaymentData {
  amount: string;
  upiId: string;
  notes: string;
  type: "income" | "expense";
}

interface UPIPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentInitiated: (data: UPIPaymentData) => void;
}

export function UPIPaymentModal({
  visible,
  onClose,
  onPaymentInitiated,
}: UPIPaymentModalProps) {
  const [step, setStep] = useState<"type" | "details">("type");
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense"
  );
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [notes, setNotes] = useState("");

  const handleTypeSelect = (type: "income" | "expense") => {
    setTransactionType(type);
    setStep("details");
  };

  const handlePaymentApp = async (app: "googlepay" | "phonepe") => {
    if (!amount || !upiId) {
      Alert.alert("Error", "Please enter amount and UPI ID");
      return;
    }

    // Validate UPI ID format
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    if (!upiRegex.test(upiId)) {
      Alert.alert(
        "Invalid UPI ID",
        "Please enter a valid UPI ID (e.g., user@googleplay)"
      );
      return;
    }

    // Create UPI deep link
    const upiLink = `upi://pay?pa=${upiId}&pn=Expense%20Tracker&am=${amount}&tn=${encodeURIComponent(
      notes || "Payment"
    )}&tr=${Date.now()}`;

    try {
      const canOpen = await Linking.canOpenURL(upiLink);
      if (!canOpen) {
        Alert.alert(
          "App Not Found",
          `${app === "googlepay" ? "Google Pay" : "PhonePe"} is not installed on your device`
        );
        return;
      }

      // Open the payment app
      await Linking.openURL(upiLink);

      // After payment attempt, record the transaction
      onPaymentInitiated({
        amount,
        upiId,
        notes,
        type: transactionType,
      });

      // Reset and close
      setTimeout(() => {
        setAmount("");
        setUpiId("");
        setNotes("");
        setStep("type");
        onClose();
      }, 500);
    } catch (error) {
      Alert.alert("Error", "Failed to open payment app");
    }
  };

  const handleClose = () => {
    setAmount("");
    setUpiId("");
    setNotes("");
    setStep("type");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background rounded-t-3xl p-6 max-h-[90%]">
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">
                {step === "type" ? "Payment Method" : "Payment Details"}
              </Text>
              <Pressable onPress={handleClose}>
                <Text className="text-2xl text-muted">✕</Text>
              </Pressable>
            </View>

            {step === "type" ? (
              // Step 1: Choose Income or Expense
              <View className="gap-3">
                <Text className="text-sm text-muted mb-2">
                  Is this an income or expense?
                </Text>

                <Pressable
                  onPress={() => handleTypeSelect("expense")}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View
                    className={cn(
                      "p-4 rounded-xl border-2 items-center gap-2",
                      transactionType === "expense"
                        ? "border-error bg-error/10"
                        : "border-border bg-surface"
                    )}
                  >
                    <Text className="text-3xl">💸</Text>
                    <Text className="font-semibold text-foreground">
                      Expense
                    </Text>
                    <Text className="text-xs text-muted">Money you spent</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => handleTypeSelect("income")}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View
                    className={cn(
                      "p-4 rounded-xl border-2 items-center gap-2",
                      transactionType === "income"
                        ? "border-success bg-success/10"
                        : "border-border bg-surface"
                    )}
                  >
                    <Text className="text-3xl">💰</Text>
                    <Text className="font-semibold text-foreground">
                      Income
                    </Text>
                    <Text className="text-xs text-muted">
                      Money you received
                    </Text>
                  </View>
                </Pressable>
              </View>
            ) : (
              // Step 2: Enter Payment Details
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Amount (₹)
                  </Text>
                  <TextInput
                    placeholder="Enter amount"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholderTextColor="#9BA1A6"
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    UPI ID
                  </Text>
                  <TextInput
                    placeholder="e.g., user@googlepay"
                    value={upiId}
                    onChangeText={setUpiId}
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholderTextColor="#9BA1A6"
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Notes (Optional)
                  </Text>
                  <TextInput
                    placeholder="What was this for?"
                    value={notes}
                    onChangeText={setNotes}
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholderTextColor="#9BA1A6"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Payment App Buttons */}
                <View className="gap-3 mt-4">
                  <Text className="text-sm text-muted">
                    Choose payment app:
                  </Text>

                  <Pressable
                    onPress={() => handlePaymentApp("googlepay")}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  >
                    <View className="bg-primary/10 border border-primary rounded-lg p-4 flex-row items-center gap-3">
                      <Text className="text-2xl">🔵</Text>
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">
                          Google Pay
                        </Text>
                        <Text className="text-xs text-muted">
                          Pay with Google Pay
                        </Text>
                      </View>
                      <Text className="text-lg">→</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => handlePaymentApp("phonepe")}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  >
                    <View className="bg-purple-500/10 border border-purple-500 rounded-lg p-4 flex-row items-center gap-3">
                      <Text className="text-2xl">📱</Text>
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">
                          PhonePe
                        </Text>
                        <Text className="text-xs text-muted">
                          Pay with PhonePe
                        </Text>
                      </View>
                      <Text className="text-lg">→</Text>
                    </View>
                  </Pressable>
                </View>

                {/* Back Button */}
                <Pressable
                  onPress={() => setStep("type")}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View className="bg-surface border border-border rounded-lg p-3 items-center mt-2">
                    <Text className="text-foreground font-semibold">← Back</Text>
                  </View>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
