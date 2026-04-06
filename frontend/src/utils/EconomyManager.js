import { Sensories } from './Sensories';

/**
 * EconomyManager - The Vibrational Economy
 * The Enlightenment Cafe | Dust → Gems Refinement
 * 
 * Tiers: basic (1x) → silver (1.5x) → gold (2x) → cosmic (5x)
 */
export const EconomyManager = {
  // Tier multipliers for Dust → Gem conversion
  MULTIPLIERS: {
    basic: 1,
    silver: 1.5,
    gold: 2,
    cosmic: 5
  },

  /**
   * Convert "Dust" (effort) into "Gems" (value)
   * @param amount - Amount of Dust to refine
   * @param userTier - User's subscription tier
   * @returns { gemsProduced, remainingDust }
   */
  refineDust(amount, userTier = 'basic') {
    const rate = this.MULTIPLIERS[userTier] || 1;
    
    return {
      gemsProduced: Math.floor(amount * rate * 0.1),
      remainingDust: amount % 10
    };
  },

  /**
   * Calculate streak bonus multiplier
   * @param streakDays - Consecutive days of practice
   * @returns Bonus multiplier (1.0 - 2.0)
   */
  getStreakBonus(streakDays) {
    if (streakDays >= 30) return 2.0;
    if (streakDays >= 14) return 1.5;
    if (streakDays >= 7) return 1.25;
    if (streakDays >= 3) return 1.1;
    return 1.0;
  },

  /**
   * Trigger Haptics based on Mineral Rarity
   * @param rarity - 'common' | 'rare' | 'cosmic'
   */
  async triggerMineralHaptic(rarity) {
    switch (rarity) {
      case 'common':
        await Sensories.tap();
        break;
      case 'rare':
        await Sensories.select();
        break;
      case 'cosmic':
        // Double pulse for legendary finds
        await Sensories.success();
        break;
      default:
        await Sensories.tap();
    }
  },

  /**
   * Award Dust for completing an activity
   * @param activityType - Type of wellness activity
   * @param duration - Duration in minutes
   * @returns Dust earned
   */
  calculateDustReward(activityType, duration) {
    const baseRates = {
      meditation: 10,
      breathwork: 8,
      soundHealing: 12,
      journaling: 6,
      tarot: 15,
      iching: 15,
      oracle: 10
    };
    
    const baseRate = baseRates[activityType] || 5;
    return Math.floor(baseRate * (duration / 10));
  }
};

export default EconomyManager;
