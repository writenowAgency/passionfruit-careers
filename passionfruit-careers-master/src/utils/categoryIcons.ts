export const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes('soft') || name.includes('develop') || name.includes('engineer')) return 'code-slash';
  if (name.includes('data')) return 'bar-chart';
  if (name.includes('design') || name.includes('art')) return 'color-palette';
  if (name.includes('market')) return 'megaphone';
  if (name.includes('sale')) return 'pricetag';
  if (name.includes('product')) return 'cube';
  if (name.includes('customer')) return 'headset';
  if (name.includes('finance') || name.includes('account')) return 'calculator';
  if (name.includes('health')) return 'medkit';
  if (name.includes('educat')) return 'school';
  if (name.includes('legal')) return 'briefcase';
  if (name.includes('security')) return 'shield-checkmark';
  return 'layers'; // default
};
