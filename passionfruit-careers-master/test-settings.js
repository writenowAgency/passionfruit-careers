// Test script to verify all settings screens
console.log("=== Settings Screens Verification ===\n");

const fs = require('fs');
const path = require('path');

const screens = [
  {
    name: 'ChangePasswordScreen',
    path: 'src/screens/employer/profile/ChangePasswordScreen.tsx',
    features: [
      'Password strength indicator',
      'Real-time validation',
      'Show/hide password toggles',
      'Requirements checklist'
    ]
  },
  {
    name: 'NotificationPreferencesScreen',
    path: 'src/screens/employer/profile/NotificationPreferencesScreen.tsx',
    features: [
      'Email notifications (5 settings)',
      'Push notifications (4 settings)',
      'SMS notifications (2 settings)',
      'Switch toggles for all settings'
    ]
  },
  {
    name: 'PrivacySettingsScreen',
    path: 'src/screens/employer/profile/PrivacySettingsScreen.tsx',
    features: [
      'Profile visibility selector',
      'Public information toggles',
      'Data & privacy settings',
      'Security settings (2FA)',
      'Data management (download/delete)'
    ]
  }
];

let allPassed = true;

screens.forEach((screen, index) => {
  console.log(`${index + 1}. ${screen.name}`);
  console.log(`   Path: ${screen.path}`);

  // Check if file exists
  const fullPath = path.join(__dirname, screen.path);
  if (!fs.existsSync(fullPath)) {
    console.log(`   ❌ File does not exist!`);
    allPassed = false;
    return;
  }
  console.log(`   ✓ File exists`);

  // Check file size
  const stats = fs.statSync(fullPath);
  console.log(`   ✓ File size: ${(stats.size / 1024).toFixed(2)} KB`);

  // Read file content
  const content = fs.readFileSync(fullPath, 'utf8');

  // Check for required imports
  const requiredImports = [
    'React',
    'ScrollView',
    'Text',
    'Card',
    'Ionicons',
    'colors',
    'spacing'
  ];

  let importsMissing = [];
  requiredImports.forEach(imp => {
    if (!content.includes(imp)) {
      importsMissing.push(imp);
    }
  });

  if (importsMissing.length > 0) {
    console.log(`   ❌ Missing imports: ${importsMissing.join(', ')}`);
    allPassed = false;
  } else {
    console.log(`   ✓ All required imports present`);
  }

  // Check for export
  if (content.includes('export default')) {
    console.log(`   ✓ Component exported`);
  } else {
    console.log(`   ❌ Component not exported!`);
    allPassed = false;
  }

  // Check features
  console.log(`   Features:`);
  screen.features.forEach(feature => {
    console.log(`     - ${feature}`);
  });

  console.log('');
});

// Check navigation configuration
console.log('Navigation Configuration:');
const navPath = 'src/navigation/EmployerDashboardStack.tsx';
if (fs.existsSync(navPath)) {
  const navContent = fs.readFileSync(navPath, 'utf8');

  const navScreens = [
    'ChangePassword',
    'NotificationPreferences',
    'PrivacySettings'
  ];

  let navMissing = [];
  navScreens.forEach(screen => {
    if (!navContent.includes(screen)) {
      navMissing.push(screen);
    }
  });

  if (navMissing.length > 0) {
    console.log(`❌ Missing navigation screens: ${navMissing.join(', ')}`);
    allPassed = false;
  } else {
    console.log('✓ All navigation screens configured');
  }
} else {
  console.log('❌ Navigation file not found!');
  allPassed = false;
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ ALL CHECKS PASSED - Screens are ready!');
} else {
  console.log('❌ SOME CHECKS FAILED - Review errors above');
}
console.log('='.repeat(50));

process.exit(allPassed ? 0 : 1);
