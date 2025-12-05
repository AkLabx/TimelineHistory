/**
 * Maps a color name to a set of Tailwind CSS classes for theming elements.
 *
 * @param colorName - The name of the color (e.g., 'amber', 'slate', 'blue').
 * @returns A string containing the Tailwind CSS classes for background, text, border, hover, and ring styles.
 */
export const getThemeClasses = (colorName: string): string => {
  const map: Record<string, string> = {
    amber: 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-50 ring-amber-500',
    slate: 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-50 ring-slate-500',
    blue: 'bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-50 ring-blue-500',
    teal: 'bg-teal-100 text-teal-900 border-teal-200 hover:bg-teal-50 ring-teal-500',
    indigo: 'bg-indigo-100 text-indigo-900 border-indigo-200 hover:bg-indigo-50 ring-indigo-500',
  };
  return map[colorName] || map.slate;
};

/**
 * Maps a color name to a set of Tailwind CSS classes for button styling.
 *
 * @param colorName - The name of the color (e.g., 'amber', 'slate', 'blue').
 * @returns A string containing the Tailwind CSS classes for background, hover, and text color.
 */
export const getButtonClasses = (colorName: string): string => {
  const map: Record<string, string> = {
    amber: 'bg-amber-600 hover:bg-amber-700 text-white',
    slate: 'bg-slate-600 hover:bg-slate-700 text-white',
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    teal: 'bg-teal-600 hover:bg-teal-700 text-white',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  };
  return map[colorName] || map.slate;
};
