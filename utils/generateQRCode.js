import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import QRCode from 'qrcode'; // For web/Node.js. For React Native, use 'react-native-qrcode-svg'.

/**
 * Generates a QR code image or data URL from a string.
 * You can use a library like 'qrcode' or 'react-native-qrcode-svg'.
 * @param {string} data - The data to encode in the QR code.
 * @param {Object} [options] - Optional QR code options.
 * @returns {Promise<string>} - A data URL or SVG string for the QR code.
 */
export default async function generateQRCode(data, options = {}) {
  try {
    // For web/Node.js: returns a data URL
    const url = await QRCode.toDataURL(data, options);
    AccessibilityInfo.announceForAccessibility('QR code generated.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return url;
  } catch (e) {
    AccessibilityInfo.announceForAccessibility('Failed to generate QR code.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    console.error('Failed to generate QR code:', e);
    return null;
  }
}

// For React Native, you would use the <QRCodeSVG value={data} {...options} /> component instead of this function.