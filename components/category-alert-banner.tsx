import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Animated, Easing, FlatList } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import { CategoryAlertRecord, getRemainingBudget } from "@/lib/category-alert-service";

export interface CategoryAlertBannerProps {
  visible: boolean;
  alerts: CategoryAlertRecord[];
  onDismiss: () => void;
  onViewBudget: () => void;
}

/**
 * Category alert banner showing which categories are near budget limits
 */
export function CategoryAlertBanner({
  visible,
  alerts,
  onDismiss,
  onViewBudget,
}: CategoryAlertBannerProps) {
  const colors = useColors();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const [isShowing, setIsShowing] = useState(visible);

  useEffect(() => {
    if (visible && alerts.length > 0) {
      setIsShowing(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setIsShowing(false);
      });
    }
  }, [visible, alerts.length, slideAnim]);

  if (!isShowing || alerts.length === 0) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        style={{
          backgroundColor: colors.warning,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 gap-3">
          <View className="flex-row items-center gap-2 flex-1">
            <MaterialIcons
              name="warning"
              size={20}
              color={colors.background}
            />
            <Text
              className="text-sm font-bold"
              style={{ color: colors.background }}
            >
              {alerts.length} {alerts.length === 1 ? "category" : "categories"} near limit
            </Text>
          </View>
          <TouchableOpacity
            onPress={onDismiss}
            className="px-2 py-1"
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="close"
              size={18}
              color={colors.background}
            />
          </TouchableOpacity>
        </View>

        {/* Alert List */}
        <FlatList
          scrollEnabled={false}
          data={alerts}
          keyExtractor={(item) => item.categoryId}
          renderItem={({ item }) => {
            const remaining = getRemainingBudget(item.spent, item.limit);
            return (
              <View
                className="px-4 py-2 flex-row items-center justify-between"
                style={{
                  backgroundColor: colors.warning,
                  borderTopWidth: 1,
                  borderTopColor: `${colors.background}33`,
                }}
              >
                <View className="flex-row items-center gap-2 flex-1">
                  <Text className="text-lg">⚠️</Text>
                  <View className="flex-1">
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: colors.background }}
                      numberOfLines={1}
                    >
                      {item.categoryName}: {item.percentage}% used
                    </Text>
                    <Text
                      className="text-xs"
                      style={{ color: colors.background, opacity: 0.85 }}
                      numberOfLines={1}
                    >
                      ₹{remaining.toFixed(2)} left
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />

        {/* Action Button */}
        <View className="px-4 py-2 flex-row gap-2">
          <TouchableOpacity
            onPress={onViewBudget}
            className="flex-1 px-3 py-2 rounded-full"
            style={{ backgroundColor: colors.background }}
            activeOpacity={0.7}
          >
            <Text
              className="text-xs font-semibold text-center"
              style={{ color: colors.warning }}
            >
              View Budgets
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
