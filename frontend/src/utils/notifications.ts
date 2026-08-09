import toast, { Toast } from 'react-hot-toast';
import React from 'react';

const baseStyle = {
  borderRadius: '14px',
  fontSize: '14px',
  fontWeight: 500,
  padding: '14px 18px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  maxWidth: '420px',
  lineHeight: 1.5,
};

const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
  loading: '⟳',
};

function createNotify(type: 'success' | 'error' | 'warning' | 'info') {
  return (message: string, options?: { duration?: number; description?: string; action?: { label: string; onClick: () => void } }) => {
    const colors = {
      success: {
        bg: '#f0fdf4',
        border: '#86efac',
        text: '#166534',
        iconBg: '#22c55e',
        iconColor: '#fff',
      },
      error: {
        bg: '#fef2f2',
        border: '#fca5a5',
        text: '#991b1b',
        iconBg: '#ef4444',
        iconColor: '#fff',
      },
      warning: {
        bg: '#fffbeb',
        border: '#fcd34d',
        text: '#92400e',
        iconBg: '#f59e0b',
        iconColor: '#fff',
      },
      info: {
        bg: '#eff6ff',
        border: '#93c5fd',
        text: '#1e40af',
        iconBg: '#3b82f6',
        iconColor: '#fff',
      },
    };

    const c = colors[type];

    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isDark ? '#1e293b' : c.bg;
    const borderColor = isDark ? '#334155' : c.border;
    const textColor = isDark ? '#e2e8f0' : c.text;
    const iconBgColor = isDark ? '#475569' : c.iconBg;

    return toast.custom(
      (t: Toast) => {
        const isVisible = t.visible;
        return React.createElement('div', {
          style: {
            ...baseStyle,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            background: bgColor,
            border: `1px solid ${borderColor}`,
            color: textColor,
            opacity: isVisible ? 1 : 0,
            transform: `translateY(${isVisible ? '0' : '-8px'}) scale(${isVisible ? '1' : '0.96'})`,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          },
        },
          React.createElement('div', {
            style: {
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: iconBgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: isDark ? '#fff' : c.iconColor,
              fontSize: '14px',
              fontWeight: 700,
              marginTop: '1px',
            },
          }, icons[type]),
          React.createElement('div', { style: { flex: 1, minWidth: 0 } },
            React.createElement('p', { style: { margin: 0, fontWeight: 600, fontSize: '14px' } }, message),
            options?.description && React.createElement('p', {
              style: { margin: '4px 0 0', fontSize: '13px', opacity: 0.75, lineHeight: 1.4 },
            }, options.description)
          ),
          options?.action && React.createElement('button', {
            onClick: () => {
              options.action!.onClick();
              toast.dismiss(t.id);
            },
            style: {
              background: 'transparent',
              border: `1px solid ${borderColor}`,
              color: textColor,
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.2s',
            },
          }, options.action.label),
          React.createElement('button', {
            onClick: () => toast.dismiss(t.id),
            style: {
              background: 'transparent',
              border: 'none',
              color: textColor,
              opacity: 0.5,
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0 4px',
              lineHeight: 1,
              flexShrink: 0,
            },
          }, '×')
        );
      },
      {
        duration: options?.duration || (type === 'error' ? 3000 : type === 'warning' ? 2000 : 1500),
        position: 'top-right',
      }
    );
  };
}

export const notify = {
  success: createNotify('success'),
  error: createNotify('error'),
  warning: createNotify('warning'),
  info: createNotify('info'),

  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: msgs.loading,
        success: msgs.success,
        error: msgs.error,
      },
      {
        style: baseStyle,
        success: {
          style: {
            ...baseStyle,
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#f0fdf4',
            border: `1px solid ${document.documentElement.classList.contains('dark') ? '#334155' : '#86efac'}`,
            color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#166534',
          },
          iconTheme: { primary: '#22c55e', secondary: '#fff' },
        },
        error: {
          style: {
            ...baseStyle,
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fef2f2',
            border: `1px solid ${document.documentElement.classList.contains('dark') ? '#334155' : '#fca5a5'}`,
            color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#991b1b',
          },
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
        },
        position: 'top-right',
      }
    );
  },

  dismiss: (id?: string) => {
    if (id) toast.dismiss(id);
    else toast.dismiss();
  },
};

export default notify;
