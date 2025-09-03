/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        surface: '#1E293B',
        focus: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        textPrimary: '#F8FAFC',
        textSecondary: '#CBD5E1',
        textMuted: '#64748B'
      },
      borderRadius: {
        xl: '0.875rem'
      },
      boxShadow: {
        card: '0 10px 25px -10px rgba(0,0,0,0.4)'
      },
      keyframes: {
        pulseSuccess: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.6)' },
          '50%': { boxShadow: '0 0 0 14px rgba(16,185,129,0)' }
        }
      },
      animation: {
        'pulse-success': 'pulseSuccess 0.8s ease-out'
      }
    }
  },
  plugins: []
};


