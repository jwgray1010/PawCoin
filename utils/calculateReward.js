import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Calculates the reward points for a chore.
 * You can customize this logic as needed.
 * @param {Object} chore - The chore object (should have at least a 'difficulty' or 'basePoints' property)
 * @returns {number} The calculated reward points
 */
export default function calculateReward(chore) {
  // Example logic: use basePoints, or calculate from difficulty
  if (!chore) {
    AccessibilityInfo.announceForAccessibility('No chore provided. Reward is 0.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return 0;
  }

  if (chore.basePoints) {
    AccessibilityInfo.announceForAccessibility(`Reward is ${chore.basePoints} points.`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return chore.basePoints;
  }

  // Example: reward = 10 for 'easy', 20 for 'medium', 30 for 'hard'
  let reward;
  switch (chore.difficulty) {
    case 'easy':
      reward = 10;
      break;
    case 'medium':
      reward = 20;
      break;
    case 'hard':
      reward = 30;
      break;
    default:
      reward = 5; // fallback for unknown difficulty
  }
  AccessibilityInfo.announceForAccessibility(`Reward is ${reward} points.`);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  return reward;
}