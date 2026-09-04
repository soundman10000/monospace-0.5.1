export type ThemeName = 'light' | 'dark'

export const isThemeName = (value: unknown): value is ThemeName =>
  value === 'light' || value === 'dark'
