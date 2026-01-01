// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper to make authenticated requests
async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add Content-Type for JSON if body is present and not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// ==================== AUTH API ====================

export const authAPI = {
  login: async (email: string, password: string) => {
    const data = await fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Save token to localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  register: async (name: string, email: string, password: string) => {
    const data = await fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    // Save token to localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },
};

// ==================== ARTWORKS API ====================

export const artworksAPI = {
  // Get all artworks with filters
  getAll: async (params?: {
    labModule?: string;
    labCategory?: string;
    author?: string;
    published?: boolean;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    return fetchAPI(`/api/artworks${queryString ? `?${queryString}` : ''}`);
  },

  // Get single artwork
  getById: async (id: string) => {
    return fetchAPI(`/api/artworks/${id}`);
  },

  // Create new artwork
  create: async (artwork: {
    title: string;
    description?: string;
    labModule: string;
    labCategory: string;
    content?: any;
    images?: string[];
    audio?: string[];
    video?: string;
    tags?: string[];
    published?: boolean;
  }) => {
    return fetchAPI('/api/artworks', {
      method: 'POST',
      body: JSON.stringify(artwork),
    });
  },

  // Update artwork
  update: async (id: string, updates: any) => {
    return fetchAPI(`/api/artworks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete artwork
  delete: async (id: string) => {
    return fetchAPI(`/api/artworks/${id}`, {
      method: 'DELETE',
    });
  },

  // Like/Unlike artwork
  toggleLike: async (id: string) => {
    return fetchAPI(`/api/artworks/${id}/like`, {
      method: 'POST',
    });
  },

  // Add comment
  addComment: async (id: string, text: string) => {
    return fetchAPI(`/api/artworks/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },
};

// ==================== ARTICLES API ====================

export const articlesAPI = {
  getAll: async (params?: {
    category?: string;
    published?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    return fetchAPI(`/api/articles${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return fetchAPI(`/api/articles/${id}`);
  },

  create: async (article: {
    title: string;
    titleEn?: string;
    content: string;
    contentEn?: string;
    category: string;
    tags?: string[];
    coverImage?: string;
  }) => {
    return fetchAPI('/api/articles', {
      method: 'POST',
      body: JSON.stringify(article),
    });
  },
};

// ==================== FILE UPLOAD API ====================

export const uploadAPI = {
  uploadFile: async (file: File, type: 'image' | 'audio' | 'video') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  },

  getFileUrl: (fileId: string): string => {
    return `${API_BASE_URL}/api/files/${fileId}`;
  },

  deleteFile: async (fileId: string) => {
    return fetchAPI(`/api/files/${fileId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== USERS API ====================

export const usersAPI = {
  getProfile: async (userId: string) => {
    return fetchAPI(`/api/users/${userId}`);
  },

  updateProfile: async (updates: {
    name?: string;
    bio?: string;
    avatar?: string;
    preferences?: any;
  }) => {
    return fetchAPI('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  follow: async (userId: string) => {
    return fetchAPI(`/api/users/${userId}/follow`, {
      method: 'POST',
    });
  },

  unfollow: async (userId: string) => {
    return fetchAPI(`/api/users/${userId}/unfollow`, {
      method: 'POST',
    });
  },
};

export default {
  auth: authAPI,
  artworks: artworksAPI,
  articles: articlesAPI,
  upload: uploadAPI,
  users: usersAPI,
};
