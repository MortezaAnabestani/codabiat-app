const API_BASE_URL = 'http://localhost:3002/api';

function getToken() {
  return localStorage.getItem('adminToken');
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

export const adminAPI = {
  // Stats
  getStats: () => fetchAPI('/admin/stats'),

  // Users
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sort?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.sort) searchParams.set('sort', params.sort);

    return fetchAPI(`/admin/users?${searchParams.toString()}`);
  },

  getUser: (id: string) => fetchAPI(`/admin/users/${id}`),

  updateUser: (id: string, data: { role?: string; xp?: number; badges?: string[] }) =>
    fetchAPI(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    fetchAPI(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  // Artworks
  getArtworks: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    labCategory?: string;
    published?: string;
    featured?: string;
    sort?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.labCategory) searchParams.set('labCategory', params.labCategory);
    if (params?.published) searchParams.set('published', params.published);
    if (params?.featured) searchParams.set('featured', params.featured);
    if (params?.sort) searchParams.set('sort', params.sort);

    return fetchAPI(`/admin/artworks?${searchParams.toString()}`);
  },

  getArtwork: (id: string) => fetchAPI(`/admin/artworks/${id}`),

  updateArtwork: (id: string, data: { published?: boolean; featured?: boolean }) =>
    fetchAPI(`/admin/artworks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteArtwork: (id: string) =>
    fetchAPI(`/admin/artworks/${id}`, {
      method: 'DELETE',
    }),

  // Articles
  getArticles: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    published?: string;
    sort?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.published) searchParams.set('published', params.published);
    if (params?.sort) searchParams.set('sort', params.sort);

    return fetchAPI(`/admin/articles?${searchParams.toString()}`);
  },

  getArticle: (id: string) => fetchAPI(`/admin/articles/${id}`),

  createArticle: (data: {
    title: string;
    titleEn?: string;
    content: string;
    contentEn?: string;
    category: string;
    tags?: string[];
    coverImage?: string;
    published?: boolean;
  }) =>
    fetchAPI('/admin/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateArticle: (
    id: string,
    data: {
      title?: string;
      titleEn?: string;
      content?: string;
      contentEn?: string;
      category?: string;
      tags?: string[];
      coverImage?: string;
      published?: boolean;
    }
  ) =>
    fetchAPI(`/admin/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteArticle: (id: string) =>
    fetchAPI(`/admin/articles/${id}`, {
      method: 'DELETE',
    }),

  // Comments
  getComments: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    targetType?: string;
    approved?: string;
    spam?: string;
    sort?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.targetType) searchParams.set('targetType', params.targetType);
    if (params?.approved) searchParams.set('approved', params.approved);
    if (params?.spam) searchParams.set('spam', params.spam);
    if (params?.sort) searchParams.set('sort', params.sort);

    return fetchAPI(`/admin/comments?${searchParams.toString()}`);
  },

  getComment: (id: string) => fetchAPI(`/admin/comments/${id}`),

  updateComment: (id: string, data: { approved?: boolean; spam?: boolean }) =>
    fetchAPI(`/admin/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteComment: (id: string) =>
    fetchAPI(`/admin/comments/${id}`, {
      method: 'DELETE',
    }),
};
