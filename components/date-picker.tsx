import { View, Text, Pressable, ScrollView } from "react-native";
import { useState, useMemo } from "react";

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  maxDaysInPast?: number;
  maxDaysInFuture?: number;
}

export function DatePicker({
  selectedDate,
  onDateChange,
  maxDaysInPast = 365,
  maxDaysInFuture = 180,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(selectedDate.getFullYear());

  const today = new Date();
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - maxDaysInPast);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDaysInFuture);

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const daysArray = [];

    const startingDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      daysArray.push(day);
    }

    return daysArray;
  }, [selectedYear, selectedMonth]);

  const years = useMemo(() => {
    const yearArray = [];
    for (let i = minDate.getFullYear(); i <= maxDate.getFullYear(); i++) {
      yearArray.push(i);
    }
    return yearArray.reverse();
  }, [minDate, maxDate]);

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedYear, selectedMonth, day);

    if (newDate >= minDate && newDate <= maxDate) {
      onDateChange(newDate);
      setShowPicker(false);
    }
  };

  const isDateDisabled = (day: number) => {
    if (!day) return true;
    const checkDate = new Date(selectedYear, selectedMonth, day);
    return checkDate < minDate || checkDate > maxDate;
  };

  const isDateSelected = (day: number) => {
    if (!day) return false;
    const checkDate = new Date(selectedYear, selectedMonth, day);
    return (
      checkDate.getDate() === selectedDate.getDate() &&
      checkDate.getMonth() === selectedDate.getMonth() &&
      checkDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDateToday = (day: number) => {
    if (!day) return false;
    const checkDate = new Date(selectedYear, selectedMonth, day);
    const currentToday = new Date();
    return (
      checkDate.getDate() === currentToday.getDate() &&
      checkDate.getMonth() === currentToday.getMonth() &&
      checkDate.getFullYear() === currentToday.getFullYear()
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <View>
      <Pressable
        onPress={() => setShowPicker(!showPicker)}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        <View className="bg-surface border border-border rounded-lg px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">📅</Text>
            <View>
              <Text className="text-xs text-muted mb-1">Transaction Date</Text>
              <Text className="text-foreground font-semibold">
                {formatDate(selectedDate)}
              </Text>
            </View>
          </View>
          <Text className="text-muted text-lg">{showPicker ? "▼" : "▶"}</Text>
        </View>
      </Pressable>

      {showPicker && (
        <View className="bg-surface border border-border rounded-lg p-4 mt-2">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="text-xs text-muted mb-2">Year</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {years.map((year) => (
                  <Pressable
                    key={year}
                    onPress={() => setSelectedYear(year)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      className={`px-3 py-2 rounded-lg border ${
                        selectedYear === year
                          ? "bg-primary border-primary"
                          : "bg-background border-border"
                      }`}
                    >
                      <Text
                        className={`font-semibold text-sm ${
                          selectedYear === year ? "text-white" : "text-foreground"
                        }`}
                      >
                        {year}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xs text-muted mb-2">Month</Text>
            <View className="flex-row flex-wrap gap-2">
              {monthNames.map((month, index) => (
                <Pressable
                  key={month}
                  onPress={() => setSelectedMonth(index)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 min-w-[30%]"
                >
                  <View
                    className={`px-2 py-2 rounded-lg border ${
                      selectedMonth === index
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text
                      className={`font-medium text-xs text-center ${
                        selectedMonth === index ? "text-white" : "text-foreground"
                      }`}
                    >
                      {month.slice(0, 3)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xs text-muted mb-2">
              {monthNames[selectedMonth]} {selectedYear}
            </Text>

            <View className="flex-row mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <View key={day} className="flex-1 items-center">
                  <Text className="text-xs text-muted font-semibold">{day}</Text>
                </View>
              ))}
            </View>

            <View>
              {Array.from({ length: Math.ceil(daysInMonth.length / 7) }).map(
                (_, weekIndex) => (
                  <View key={weekIndex} className="flex-row mb-1">
                    {daysInMonth.slice(weekIndex * 7, (weekIndex + 1) * 7).map(
                      (day, dayIndex) => (
                        <Pressable
                          key={`${weekIndex}-${dayIndex}`}
                          onPress={() => day && handleDateSelect(day)}
                          disabled={day ? isDateDisabled(day) : true}
                          style={({ pressed }) => [
                            { opacity: pressed && day ? 0.7 : 1 },
                          ]}
                          className="flex-1 aspect-square"
                        >
                          <View
                            className={`flex-1 items-center justify-center rounded-lg border ${
                              !day
                                ? "bg-transparent border-transparent"
                                : isDateSelected(day)
                                  ? "bg-primary border-primary"
                                  : isDateToday(day)
                                    ? "bg-success/10 border-success"
                                    : isDateDisabled(day)
                                      ? "bg-border/20 border-border"
                                      : "bg-background border-border"
                            }`}
                          >
                            {day && (
                              <Text
                                className={`text-xs font-semibold ${
                                  isDateSelected(day)
                                    ? "text-white"
                                    : isDateDisabled(day)
                                      ? "text-muted"
                                      : "text-foreground"
                                }`}
                              >
                                {day}
                              </Text>
                            )}
                          </View>
                        </Pressable>
                      )
                    )}
                  </View>
                )
              )}
            </View>
          </View>

          <Pressable
            onPress={() => setShowPicker(false)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View className="bg-surface border border-border rounded-lg py-3">
              <Text className="text-foreground font-semibold text-center">Done</Text>
            </View>
          </Pressable>

          <Text className="text-xs text-muted text-center mt-3">
            You can select dates up to {maxDaysInPast} days in the past or {maxDaysInFuture} days in the future
          </Text>
        </View>
      )}
    </View>
  );
}
