import {
  Coffee, ShoppingBag, Plane, Zap, Gift, Heart, BookOpen,
  Briefcase, TrendingUp, MoreHorizontal, Film, Car
} from 'lucide-react';

export const CATEGORIES = [
  { name: 'Food & Dining',     icon: Coffee,       color: '#F97316', type: 'expense' },
  { name: 'Shopping',          icon: ShoppingBag,  color: '#8B5CF6', type: 'expense' },
  { name: 'Travel',            icon: Plane,        color: '#06B6D4', type: 'expense' },
  { name: 'Bills & Utilities', icon: Zap,          color: '#EF4444', type: 'expense' },
  { name: 'Entertainment',     icon: Film,         color: '#EC4899', type: 'expense' },
  { name: 'Healthcare',        icon: Heart,        color: '#10B981', type: 'expense' },
  { name: 'Education',         icon: BookOpen,     color: '#F59E0B', type: 'expense' },
  { name: 'Transport',         icon: Car,          color: '#64748B', type: 'expense' },
  { name: 'Salary',            icon: Briefcase,    color: '#22C55E', type: 'income'  },
  { name: 'Freelance',         icon: Zap,          color: '#34D399', type: 'income'  },
  { name: 'Investment',        icon: TrendingUp,   color: '#6EE7B7', type: 'income'  },
  { name: 'Gift',              icon: Gift,         color: '#A78BFA', type: 'income'  },
  { name: 'Other',             icon: MoreHorizontal, color: '#94A3B8', type: 'both' },
];

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const getCategoryMeta = (name) =>
  CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1];
