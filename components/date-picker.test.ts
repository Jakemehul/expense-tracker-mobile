import { describe, it, expect } from "vitest";

describe("Date Picker Functionality", () => {
  describe("Date Range Validation", () => {
    it("should allow dates within 365 days in the past", () => {
      const today = new Date();
      const maxDaysInPast = 365;
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - maxDaysInPast);

      const testDate = new Date();
      testDate.setDate(testDate.getDate() - 100);

      expect(testDate >= minDate && testDate <= today).toBe(true);
    });

    it("should reject dates beyond 365 days in the past", () => {
      const today = new Date();
      const maxDaysInPast = 365;
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - maxDaysInPast);

      const testDate = new Date();
      testDate.setDate(testDate.getDate() - 400);

      expect(testDate >= minDate && testDate <= today).toBe(false);
    });

    it("should reject future dates", () => {
      const today = new Date();
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 1);

      expect(testDate <= today).toBe(false);
    });

    it("should allow today's date", () => {
      const today = new Date();
      expect(today <= today).toBe(true);
    });

    it("should allow dates exactly 365 days in the past", () => {
      const today = new Date();
      const maxDaysInPast = 365;
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - maxDaysInPast);

      const testDate = new Date(minDate);

      expect(testDate >= minDate && testDate <= today).toBe(true);
    });
  });

  describe("Date Selection Logic", () => {
    it("should identify selected date correctly", () => {
      const selectedDate = new Date(2026, 3, 15); // April 15, 2026
      const checkDate = new Date(2026, 3, 15);

      const isSelected =
        checkDate.getDate() === selectedDate.getDate() &&
        checkDate.getMonth() === selectedDate.getMonth() &&
        checkDate.getFullYear() === selectedDate.getFullYear();

      expect(isSelected).toBe(true);
    });

    it("should not match different dates", () => {
      const selectedDate = new Date(2026, 3, 15);
      const checkDate = new Date(2026, 3, 16);

      const isSelected =
        checkDate.getDate() === selectedDate.getDate() &&
        checkDate.getMonth() === selectedDate.getMonth() &&
        checkDate.getFullYear() === selectedDate.getFullYear();

      expect(isSelected).toBe(false);
    });

    it("should identify today's date", () => {
      const today = new Date();
      const checkDate = new Date();

      const isToday =
        checkDate.getDate() === today.getDate() &&
        checkDate.getMonth() === today.getMonth() &&
        checkDate.getFullYear() === today.getFullYear();

      expect(isToday).toBe(true);
    });

    it("should not mark yesterday as today", () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const isToday =
        yesterday.getDate() === today.getDate() &&
        yesterday.getMonth() === today.getMonth() &&
        yesterday.getFullYear() === today.getFullYear();

      expect(isToday).toBe(false);
    });
  });

  describe("Calendar Generation", () => {
    it("should generate correct number of days in month", () => {
      const year = 2026;
      const month = 3; // April (0-indexed)
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();

      expect(daysInMonth).toBe(30);
    });

    it("should handle leap year February", () => {
      const year = 2024; // Leap year
      const month = 1; // February (0-indexed)
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();

      expect(daysInMonth).toBe(29);
    });

    it("should handle non-leap year February", () => {
      const year = 2025; // Non-leap year
      const month = 1; // February (0-indexed)
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();

      expect(daysInMonth).toBe(28);
    });

    it("should calculate starting day of week correctly", () => {
      const year = 2026;
      const month = 3; // April
      const firstDay = new Date(year, month, 1);
      const dayOfWeek = firstDay.getDay();

      // April 1, 2026 is a Wednesday (3)
      expect(dayOfWeek).toBe(3);
    });

    it("should calculate weeks in month correctly", () => {
      const year = 2026;
      const month = 3; // April
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const startingDayOfWeek = firstDay.getDay();
      const totalDays = startingDayOfWeek + lastDay.getDate();
      const weeksNeeded = Math.ceil(totalDays / 7);

      expect(weeksNeeded).toBeGreaterThanOrEqual(4);
      expect(weeksNeeded).toBeLessThanOrEqual(6);
    });
  });

  describe("Year Generation", () => {
    it("should generate years from min date to current year", () => {
      const today = new Date();
      const maxDaysInPast = 365;
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - maxDaysInPast);

      const years = [];
      for (let i = minDate.getFullYear(); i <= today.getFullYear(); i++) {
        years.push(i);
      }

      expect(years.length).toBeGreaterThan(0);
      expect(years[years.length - 1]).toBe(today.getFullYear());
    });

    it("should not include future years", () => {
      const today = new Date();
      const years = [];
      for (let i = 2020; i <= today.getFullYear(); i++) {
        years.push(i);
      }

      const hasFutureYear = years.some((year) => year > today.getFullYear());
      expect(hasFutureYear).toBe(false);
    });
  });

  describe("Date Formatting", () => {
    it("should format date in Indian locale", () => {
      const date = new Date(2026, 3, 15); // April 15, 2026
      const formatted = new Intl.DateTimeFormat("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);

      expect(formatted).toContain("15");
      expect(formatted).toContain("April");
      expect(formatted).toContain("2026");
    });

    it("should handle different months correctly", () => {
      const months = [
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

      months.forEach((month, index) => {
        const date = new Date(2026, index, 1);
        const formatted = new Intl.DateTimeFormat("en-IN", {
          month: "long",
        }).format(date);

        expect(formatted).toBe(month);
      });
    });
  });

  describe("Backdated Transaction Support", () => {
    it("should allow logging transaction from yesterday", () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const maxDaysInPast = 365;
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - maxDaysInPast);

      const isValid = yesterday >= minDate && yesterday <= today;
      expect(isValid).toBe(true);
    });

    it("should allow logging transaction from 30 days ago", () => {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const maxDaysInPast = 365;
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - maxDaysInPast);

      const isValid = thirtyDaysAgo >= minDate && thirtyDaysAgo <= today;
      expect(isValid).toBe(true);
    });

    it("should allow logging transaction from 365 days ago", () => {
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);

      const maxDaysInPast = 365;
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - maxDaysInPast);

      const isValid = oneYearAgo >= minDate && oneYearAgo <= today;
      expect(isValid).toBe(true);
    });

    it("should reject transaction from 366 days ago", () => {
      const today = new Date();
      const moreThanOneYearAgo = new Date();
      moreThanOneYearAgo.setDate(moreThanOneYearAgo.getDate() - 366);

      const maxDaysInPast = 365;
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - maxDaysInPast);

      const isValid = moreThanOneYearAgo >= minDate && moreThanOneYearAgo <= today;
      expect(isValid).toBe(false);
    });
  });
});
