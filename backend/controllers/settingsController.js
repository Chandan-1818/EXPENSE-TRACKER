const User = require('../models/User');
const validThemes = ['classic', 'modern-light', 'glass-dark', 'dark'];

const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', errors: [] });
    }
    
    let needsSave = false;

    // Ensure preferences object exists (in case of legacy users)
    if (!user.preferences) {
      user.preferences = {};
      needsSave = true;
    }
    
    if (!validThemes.includes(user.preferences.theme)) {
      user.preferences.theme = 'classic';
      needsSave = true;
    }

    if (needsSave) {
      await user.save();
    }

    res.json({
      success: true,
      message: 'Settings fetched successfully',
      data: user.preferences
    });
  } catch (error) {
    console.error('Error in getSettings:', error);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch settings', 
      errors: process.env.NODE_ENV === 'development' ? [error.message, error.stack] : [error.message] 
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', errors: [] });
    }
    
    // Ensure preferences object exists (in case of legacy users)
    if (!user.preferences) {
      user.preferences = {};
    }

    const { theme, currency, emailNotif, pushNotif, budgetAlerts, dateFormat, language, monthlyBudget } = req.body;

    if (theme !== undefined) {
      if (validThemes.includes(theme)) {
        user.preferences.theme = theme;
      } else {
        user.preferences.theme = 'classic';
      }
    }
    if (currency !== undefined) user.preferences.currency = currency;
    if (emailNotif !== undefined) user.preferences.emailNotif = emailNotif;
    if (pushNotif !== undefined) user.preferences.pushNotif = pushNotif;
    if (budgetAlerts !== undefined) user.preferences.budgetAlerts = budgetAlerts;
    if (dateFormat !== undefined) user.preferences.dateFormat = dateFormat;
    if (language !== undefined) user.preferences.language = language;
    if (monthlyBudget !== undefined) user.preferences.monthlyBudget = monthlyBudget;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedUser.preferences
    });
  } catch (error) {
    console.error('Error in updateSettings:', error);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update settings', 
      errors: process.env.NODE_ENV === 'development' ? [error.message, error.stack] : [error.message] 
    });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
