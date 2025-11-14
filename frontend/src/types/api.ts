export type FelizResponse<T> = {
  success: boolean;
  payload: T;
  errors?: unknown;
  fielderrors?: Record<string, string[]>;
  message?: string;
  code?: string;
};

export type DomainValue = {
  id: number;
  value?: string;
  text?: string;
};

export type MediaItem = {
  id: number;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | string;
  name?: string;
  url?: string;
};

export type ProfileSummary = {
  id: number;
  text: string;
  gender?: string;
  status?: number;
  description?: string;
  countryId?: number;
  cityId?: number;
  city?: { id?: number; name?: string } | string;
  country?: { id?: number; name?: string } | string;
  occupation?: DomainValue;
  educationalDegree?: DomainValue;
  religion?: DomainValue;
  political?: DomainValue;
  partnerGender?: string;
  birthyear?: number;
  image?: string;
  pendingImage?: boolean;
  media?: MediaItem[];
  interests?: string[];
  blocked?: boolean;
  microImageUrl?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
};

export type MessageEnvelope = {
  type: string;
  toProfileId: number;
  fromProfileId: number;
  fromProfileName: string;
  text: string;
  timestamp: number;
  microImageUrl?: string;
};

export type PagedProfiles = {
  profiles: ProfileSummary[];
  pageInfo?: {
    total?: number;
    nextPageNo?: string;
    prevPageNo?: string;
  };
};

export type SessionPayload = {
  csrfToken: string;
  domestic: boolean;
  email?: string;
  userType?: number;
  profile?: ProfileSummary | null;
};

