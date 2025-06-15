import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Formats a timestamp or Date object into a human-readable time string.
 * @param {number|Date} time - The time as a timestamp (ms) or Date object.
 * @param {Object} [options] - Optional formatting options.
 * @returns {string} Formatted time, e.g. "2:30 PM" or "14:30"
 */
export default function formatTime(time, options = {}) {
  const date = time instanceof Date ? time : new Date(time);
  const { hour12 = true, showSeconds = false } = options;

  const opts = {
    hour: 'numeric',
    minute: '2-digit',
    ...(showSeconds ? { second: '2-digit' } : {}),
    hour12,
  };

  const formatted = date.toLocaleTimeString([], opts);
  AccessibilityInfo.announceForAccessibility(`Time formatted as ${formatted}.`);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  return formatted;
}