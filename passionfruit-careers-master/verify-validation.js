const fs = require('fs');

console.log("=== Form Validation Verification ===\n");

// Check ChangePasswordScreen validation
console.log("1. ChangePasswordScreen Validation:");
const changePasswordContent = fs.readFileSync('src/screens/employer/profile/ChangePasswordScreen.tsx', 'utf8');

const validations = [
  { check: 'Empty fields check', pattern: /!currentPassword \|\| !newPassword \|\| !confirmPassword/ },
  { check: 'Minimum length (8 chars)', pattern: /newPassword\.length < 8/ },
  { check: 'Passwords match', pattern: /newPassword !== confirmPassword/ },
  { check: 'Different from current', pattern: /currentPassword === newPassword/ },
  { check: 'Password strength meter', pattern: /getPasswordStrength/ },
  { check: 'Uppercase + lowercase check', pattern: /\/\[a-z\]\/.*\/\[A-Z\]\// },
  { check: 'Number check', pattern: /\/\[0-9\]\// },
  { check: 'Special character check', pattern: /\/\[^a-zA-Z0-9\]\// }
];

let passed = 0;
validations.forEach(val => {
  if (val.pattern.test(changePasswordContent)) {
    console.log(`   ✓ ${val.check}`);
    passed++;
  } else {
    console.log(`   ❌ ${val.check}`);
  }
});
console.log(`   Result: ${passed}/${validations.length} checks passed\n`);

// Check NotificationPreferencesScreen toggles
console.log("2. NotificationPreferencesScreen Toggles:");
const notificationContent = fs.readFileSync('src/screens/employer/profile/NotificationPreferencesScreen.tsx', 'utf8');

const notificationSettings = [
  'emailNewApplications',
  'emailApplicationUpdates',
  'emailJobExpiring',
  'emailWeeklySummary',
  'emailMarketingUpdates',
  'pushNewApplications',
  'pushApplicationUpdates',
  'pushJobExpiring',
  'pushMessages',
  'smsUrgentAlerts',
  'smsImportantUpdates'
];

let togglesPassed = 0;
notificationSettings.forEach(setting => {
  if (notificationContent.includes(setting)) {
    togglesPassed++;
  }
});
console.log(`   ✓ ${togglesPassed}/${notificationSettings.length} notification settings found`);
console.log(`   ✓ Toggle function: ${notificationContent.includes('toggleSetting') ? 'Present' : 'Missing'}`);
console.log(`   ✓ Save function: ${notificationContent.includes('handleSave') ? 'Present' : 'Missing'}\n`);

// Check PrivacySettingsScreen features
console.log("3. PrivacySettingsScreen Features:");
const privacyContent = fs.readFileSync('src/screens/employer/profile/PrivacySettingsScreen.tsx', 'utf8');

const privacyFeatures = [
  { feature: 'Profile visibility options', pattern: /profileVisibility.*public.*private.*recruiters-only/ },
  { feature: 'Toggle settings', pattern: /toggleSetting/ },
  { feature: 'Delete account handler', pattern: /handleDeleteAccount/ },
  { feature: 'Download data handler', pattern: /handleDownloadData/ },
  { feature: 'Save functionality', pattern: /handleSave/ }
];

let privacyPassed = 0;
privacyFeatures.forEach(feature => {
  if (feature.pattern.test(privacyContent)) {
    console.log(`   ✓ ${feature.feature}`);
    privacyPassed++;
  } else {
    console.log(`   ❌ ${feature.feature}`);
  }
});
console.log(`   Result: ${privacyPassed}/${privacyFeatures.length} features present\n`);

console.log("=".repeat(50));
const totalPassed = passed === validations.length && togglesPassed === notificationSettings.length && privacyPassed === privacyFeatures.length;
if (totalPassed) {
  console.log("✅ ALL VALIDATION CHECKS PASSED!");
} else {
  console.log("⚠️  Some validation features may need review");
}
console.log("=".repeat(50));
