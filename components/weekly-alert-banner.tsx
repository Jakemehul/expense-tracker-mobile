import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import { getWeeklySpendingPercentage } from "@/lib/weekly-alert-service";

export interface WeeklyAlertBannerProps {
  visible: boolean;
  weeklySpent: number;
  weeklyBudget: number;
  onDismiss: () => void;
  onViewBudget: () => void;
}

/**
 * Sleek, non-intrusive banner that slides in from the top
 * Shows weekly budget warning at 80% threshold
 */
export function WeeklyAlertBanner({
  visible,
  weeklySpent,
  weeklyBudget,
  onDismiss,
  onViewBudget,
}: WeeklyAlertBannerProps) {
  const colors = useColors();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const [isShowing, setIsShowing] = useState(visible);

  useEffect(() => {
    if (visible) {
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
  }, [visible, slideAnim]);

  if (!isShowing) return null;

  const percentage = getWeeklySpendingPercentage(weeklySpent, weeklyBudget);
  const remaining = weeklyBudget - weeklySpent;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        className="flex-row items-center justify-between px-4 py-3 gap-3"
        style={{
          backgroundColor: colors.warning,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {/* Icon + Info */}
        <View className="flex-row items-center flex-1 gap-3">
          <MaterialIcons
            name="trending-up"
            size={20}
            color={colors.background}
          />
          <View className="flex-1">
            <Text
              className="text-xs font-semibold"
              style={{ color: colors.background }}
              numberOfLines={1}
            >
              {percentage}% of weekly budget used
            </Text>
            <Text
              className="text-xs"
              style={{ color: colors.background, opacity: 0.9 }}
              numberOfLines={1}
            >
              ₹{remaining.toFixed(2)} remaining
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-2">
          {/* View Budget Button */}
          <TouchableOpacity
            onPress={onViewBudget}
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: colors.background }}
            activeOpacity={0.7}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: colors.warning }}
            >
              View
            </Text>
          </TouchableOpacity>

          {/* Dismiss Button */}
          <TouchableOpacity
            onPress={onDismiss}
            className="px-2 py-1.5"
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="close"
              size={18}
              color={colors.background}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
