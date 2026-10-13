/**
 * Meta Pixel Event Tracking Utility
 *
 * Events:
 * - InitiateCheckout: When user sees onboarding/signup page (started signup)
 * - CompleteRegistration: When user completes signup and navigates to home
 * - Purchase: When user subscribes to a paid plan
 *
 * Advanced Matching:
 * - Supports sending user data (email, phone, external_id) for better attribution
 */

import { fireDB } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Hash a string using SHA-256 (required for Meta Pixel user data)
 * @param {string} str - The string to hash
 * @returns {Promise<string>} - The hashed string in lowercase hex
 */
const hashString = async (str) => {
    if (!str) return undefined;
    const normalized = str.toLowerCase().trim();
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Track a Meta Pixel event
 * @param {string} eventName - The name of the event to track
 * @param {object} params - Optional parameters to send with the event
 * @param {object} userData - Optional user data for Advanced Matching (email, phone, external_id)
 */
export const trackMetaEvent = async (eventName, params = {}, userData = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
        try {
            // Prepare user data for Advanced Matching (hash required fields)
            const hashedUserData = {};

            if (userData.email) {
                hashedUserData.em = await hashString(userData.email);
            }
            if (userData.phone) {
                // Remove non-numeric characters and hash
                const cleanPhone = userData.phone.replace(/\D/g, '');
                hashedUserData.ph = await hashString(cleanPhone);
            }
            if (userData.external_id) {
                hashedUserData.external_id = userData.external_id;
            }
            if (userData.firstName) {
                hashedUserData.fn = await hashString(userData.firstName);
            }
            if (userData.lastName) {
                hashedUserData.ln = await hashString(userData.lastName);
            }
            if (userData.country) {
                hashedUserData.country = await hashString(userData.country);
            }

            // If we have user data, use fbq with user data
            if (Object.keys(hashedUserData).length > 0) {
                window.fbq('track', eventName, params, { userData: hashedUserData });
                console.log(`[Meta Pixel] Tracked event: ${eventName}`, params, 'with user data');
            } else {
                window.fbq('track', eventName, params);
                console.log(`[Meta Pixel] Tracked event: ${eventName}`, params);
            }
        } catch (error) {
            console.error('[Meta Pixel] Error tracking event:', error);
            // Fallback to basic tracking without user data
            window.fbq('track', eventName, params);
        }
    } else {
        console.warn('[Meta Pixel] fbq not available');
    }
};

/**
 * Track when user starts the signup process (sees onboarding)
 */
export const trackStartedSignup = () => {
    trackMetaEvent('InitiateCheckout', {
        content_name: 'Signup Started',
        content_category: 'Registration'
    });
};

/**
 * Track page view - useful for SPA route changes
 * @param {string} pagePath - Optional path of the page (defaults to current location)
 * @param {string} pageTitle - Optional title of the page
 */
export const trackPageView = (pagePath, pageTitle) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView');
        console.log(`[Meta Pixel] PageView tracked: ${pagePath || window.location.pathname}`);
    }
};

/**
 * Track when user completes registration and navigates to home
 * @param {object} userData - User data for Advanced Matching
 * @param {string} userData.email - User's email address
 * @param {string} userData.phone - User's phone number (optional)
 * @param {string} userData.external_id - User's internal ID (optional)
 * @param {string} userData.firstName - User's first name (optional)
 */
export const trackCompletedSignup = (userData = {}) => {
    trackMetaEvent('CompleteRegistration', {
        content_name: 'Signup Completed',
        status: 'success',
        value: 0,
        currency: 'USD'
    }, userData);
};

/**
 * Track when user subscribes to a paid plan (Purchase event)
 * Uses localStorage first, then Firebase as fallback to ensure the event is only sent once per user
 *
 * @param {object} subscriptionData - Subscription details
 * @param {string} subscriptionData.userId - User's internal ID (required for deduplication)
 * @param {string} subscriptionData.planId - The plan ID
 * @param {string} subscriptionData.planName - The plan name
 * @param {number} subscriptionData.value - The subscription value/price
 * @param {string} subscriptionData.currency - Currency code (default: USD)
 * @param {object} userData - User data for Advanced Matching
 */
export const trackSubscription = async (subscriptionData = {}, userData = {}) => {
    const { userId, planId, planName, value = 0, currency = 'USD' } = subscriptionData;
    const localStorageKey = `meta_pixel_sub_${userId}`;

    if (!userId) {
        console.warn('[Meta Pixel] trackSubscription: userId is required');
        return false;
    }

    // Skip if plan is free
    if (planId === 'free' || !planId) {
        console.log('[Meta Pixel] Skipping subscription tracking for free plan');
        return false;
    }

    try {
        // Step 1: Check localStorage first (fast check)
        const localData = localStorage.getItem(localStorageKey);
        if (localData) {
            const parsed = JSON.parse(localData);
            if (parsed.subscription_sent && parsed.plan_id === planId) {
                console.log('[Meta Pixel] Subscription already tracked (from localStorage)');
                return false;
            }
        }

        // Step 2: If not in localStorage, check Firebase (fallback for cross-device)
        const docRef = doc(fireDB, 'meta_pixel_conversions', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // If we've already sent the subscription event for this plan, skip
            if (data.subscription_sent && data.plan_id === planId) {
                // Save to localStorage for future quick checks
                localStorage.setItem(localStorageKey, JSON.stringify({
                    subscription_sent: true,
                    plan_id: planId
                }));
                console.log('[Meta Pixel] Subscription already tracked (from Firebase, cached to localStorage)');
                return false;
            }
        }

        // Step 3: Send the Purchase event to Meta Pixel
        await trackMetaEvent('Purchase', {
            content_name: planName || planId,
            content_type: 'subscription',
            content_ids: [planId],
            value: value,
            currency: currency,
            num_items: 1
        }, userData);

        // Step 4: Save to localStorage (for quick future checks)
        localStorage.setItem(localStorageKey, JSON.stringify({
            subscription_sent: true,
            plan_id: planId,
            plan_name: planName,
            sent_at: new Date().toISOString()
        }));

        // Step 5: Save to Firebase (for cross-device persistence)
        await setDoc(docRef, {
            subscription_sent: true,
            plan_id: planId,
            plan_name: planName,
            value: value,
            currency: currency,
            sent_at: serverTimestamp(),
            user_id: userId
        }, { merge: true });

        console.log('[Meta Pixel] Subscription tracked and saved to localStorage + Firebase');
        return true;

    } catch (error) {
        console.error('[Meta Pixel] Error tracking subscription:', error);
        return false;
    }
};

export default {
    trackMetaEvent,
    trackStartedSignup,
    trackPageView,
    trackCompletedSignup,
    trackSubscription
};
