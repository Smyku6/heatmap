import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 *
 * This function combines clsx for conditional classes and tailwind-merge
 * to handle Tailwind class conflicts intelligently.
 *
 * @example
 * ```tsx
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500')
 * // => 'px-4 py-2 bg-blue-500'
 *
 * // Conditional classes
 * cn('base-class', isActive && 'active-class', isFocused && 'focus-class')
 *
 * // Conflicting classes (last one wins)
 * cn('px-2', 'px-4')
 * // => 'px-4'
 *
 * // Complex example
 * cn(
 *   'px-4 py-2 rounded-lg',
 *   variant === 'primary' && 'bg-blue-500 text-white',
 *   variant === 'secondary' && 'bg-gray-200 text-gray-900',
 *   disabled && 'opacity-50 cursor-not-allowed'
 * )
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
