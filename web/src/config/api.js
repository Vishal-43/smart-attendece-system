const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://l6dtnrdl-8000.inc1.devtunnels.ms',
  API_PREFIX: '/api/v1',

  get API_BASE_URL() {
    return `${this.BASE_URL}${this.API_PREFIX}`;
  },

  get WS_BASE_URL() {
    return this.BASE_URL.replace(/^http/, 'ws').replace(/^https/, 'wss');
  },

  TIMEOUTS: {
    CONNECT: 10000,
    RECEIVE: 30000,
  },
};

export default API_CONFIG;
