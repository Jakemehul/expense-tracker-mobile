import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: string;
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

/**
 * Enhanced category badge component with icon, color, and styling
 */
export function CategoryBadge({
  category,
  icon,
  color,
  size = "md",
  showLabel = true,
}: CategoryBadgeProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  const labelSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <View className="items-center gap-1">
      <View
        className={cn(
          "rounded-full items-center justify-center",
          sizeClasses[size]
        )}
        style={{ backgroundColor: color + "20" }} // 20% opacity
      >
        <Text className={iconSizeClasses[size]}>{icon}</Text>
      </View>
      {showLabel && (
        <Text
          className={cn("font-medium text-foreground text-center", labelSizeClasses[size])}
          numberOfLines={1}
        >
          {category}
        </Text>
      )}
    </View>
  );
}
