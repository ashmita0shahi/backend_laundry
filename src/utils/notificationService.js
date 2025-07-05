const User = require('../models/User');
const sendEmail = require('./sendEmail');

/**
 * Send a notification to a user
 * @param {string} userId - The ID of the user to notify
 * @param {string} message - The notification message
 * @param {string} type - The notification type (order_confirmed, washing, drying, out_for_delivery, delivered, payment)
 * @param {boolean} sendEmailNotification - Whether to send an email notification as well
 */
const sendNotification = async (userId, message, type, sendEmailNotification = true) => {
  try {
    // Add notification to user's notifications array
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.notifications.push({
      message,
      type,
      read: false,
      createdAt: new Date()
    });

    await user.save();

    // Send email notification if requested
    if (sendEmailNotification) {
      await sendEmail({
        to: user.email,
        subject: `LaundryEase Notification: ${getNotificationSubject(type)}`,
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #3498db;">LaundryEase Notification</h2>
            <p style="font-size: 16px; line-height: 1.5;">${message}</p>
            <p style="font-size: 14px; color: #666;">Thank you for using LaundryEase!</p>
          </div>
        `
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mark a notification as read
 * @param {string} userId - The ID of the user
 * @param {string} notificationId - The ID of the notification to mark as read
 */
const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const notification = user.notifications.id(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    await user.save();

    return { success: true };
  } catch (error) {
    console.error('Mark notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all notifications for a user
 * @param {string} userId - The ID of the user
 */
const getNotifications = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      notifications: user.notifications.sort((a, b) => b.createdAt - a.createdAt)
    };
  } catch (error) {
    console.error('Get notifications error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a subject line based on notification type
 * @param {string} type - The notification type
 */
const getNotificationSubject = (type) => {
  switch (type) {
    case 'order_confirmed':
      return 'Order Confirmed';
    case 'washing':
      return 'Your Clothes Are Being Washed';
    case 'drying':
      return 'Your Clothes Are Being Dried';
    case 'out_for_delivery':
      return 'Your Order Is Out For Delivery';
    case 'delivered':
      return 'Your Order Has Been Delivered';
    case 'payment':
      return 'Payment Update';
    default:
      return 'Notification';
  }
};

module.exports = {
  sendNotification,
  markNotificationAsRead,
  getNotifications
};
