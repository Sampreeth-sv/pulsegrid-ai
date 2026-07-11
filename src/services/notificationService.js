// Notification Service
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let notifications = [];
let notificationId = 1;
let subscribers = [];

const getNotifIcon = (type) => {
  const icons = {
    INCIDENT: 'AlertTriangle', MEDICAL: 'Heart', SECURITY: 'Shield',
    CROWD: 'Users', TRANSPORT: 'Bus', VOLUNTEER: 'UserCheck',
    SUCCESS: 'CheckCircle', INFO: 'Info', WARNING: 'AlertCircle',
    BROADCAST: 'Radio', SYSTEM: 'Settings',
  };
  return icons[type] || 'Bell';
};

export const notificationService = {
  add(type, title, message, priority = 'NORMAL') {
    const notif = {
      id: `NOTIF-${notificationId++}`,
      type,
      title,
      message,
      priority,
      icon: getNotifIcon(type),
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifications = [notif, ...notifications].slice(0, 50);
    subscribers.forEach((fn) => fn([...notifications]));
    return notif;
  },

  markRead(id) {
    notifications = notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    subscribers.forEach((fn) => fn([...notifications]));
  },

  markAllRead() {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    subscribers.forEach((fn) => fn([...notifications]));
  },

  dismiss(id) {
    notifications = notifications.filter((n) => n.id !== id);
    subscribers.forEach((fn) => fn([...notifications]));
  },

  getAll() { return [...notifications]; },

  getUnreadCount() { return notifications.filter((n) => !n.read).length; },

  subscribe(fn) {
    subscribers.push(fn);
    fn([...notifications]);
    return () => { subscribers = subscribers.filter((s) => s !== fn); };
  },

  async broadcastMessage(message, channels = ['app', 'display', 'audio']) {
    await sleep(300 + Math.random() * 200);
    this.add('BROADCAST', 'Message Broadcast', `Sent to ${channels.join(', ')}: "${message.substring(0, 50)}..."`, 'HIGH');
    return {
      success: true,
      channels,
      reach: Math.round(5000 + Math.random() * 10000),
      timestamp: new Date().toISOString(),
    };
  },
};

// Seed initial notifications
notificationService.add('INCIDENT', 'Gate D Critical Congestion', 'AI detected risk score 87. Immediate action recommended.', 'CRITICAL');
notificationService.add('MEDICAL', 'Medical Alert - Gate B', 'Medical team dispatched to Section 112.', 'HIGH');
notificationService.add('INFO', 'Simulation Active', 'PulseGrid AI simulation running. All systems nominal.', 'LOW');

export default notificationService;
