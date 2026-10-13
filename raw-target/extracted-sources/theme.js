/**
 * InstantDM 2.0 antd theme.
 *
 * KEEP IN SYNC with src/styles/tokens.css — values here must be literal hex
 * (antd derives hover/active/bg variants by parsing the color, so var()
 * strings would break shade generation).
 *
 * Deliberately does NOT set controlHeight or fontSize: keeping antd's box
 * metrics stock means zero layout reflow anywhere in the app.
 */
export const appTheme = {
  token: {
    colorPrimary: '#6366f1',
    colorInfo: '#6366f1',
    colorLink: '#6366f1',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorTextBase: '#1e293b',
    colorBgLayout: '#f8fafc',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#eef1f6',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  components: {
    Button: {
      fontWeight: 500,
      primaryShadow: 'none',
    },
    Menu: {
      itemSelectedBg: '#eef2ff',
      itemSelectedColor: '#4f46e5',
      itemBorderRadius: 8,
      itemMarginInline: 8,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Tabs: {
      itemSelectedColor: '#4f46e5',
      inkBarColor: '#6366f1',
    },
    Segmented: {
      itemSelectedBg: '#ffffff',
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#475569',
      rowHoverBg: '#f8faff',
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Alert: {
      borderRadiusLG: 8,
    },
    Layout: {
      siderBg: '#ffffff',
    },
  },
};
