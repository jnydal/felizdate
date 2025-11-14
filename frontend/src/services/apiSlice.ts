import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithPayload } from '@/app/api/baseQuery';
import { toFormBody } from '@/lib/formData';
import type {
  MessageEnvelope,
  PagedProfiles,
  ProfileSummary,
  SessionPayload,
} from '@/types/api';

export type LoginRequest = {
  email: string;
  password: string;
};

export type StatusRequest = {
  status: number;
};

export type PositionRequest = {
  longitude: number;
  latitude: number;
};

export type SendMessageRequest = {
  toProfileId: number;
  message: string;
  pushMessage?: boolean;
};

export type ConversationParams = {
  profileId: number;
};

export type SearchProfilesPayload = {
  keyword?: string;
  gender?: string;
  minage?: number;
  maxage?: number;
  countryId?: number;
  cityId?: number;
  loggedIn?: 'on' | 'off';
  pageNo?: number;
  countPrPage?: number;
};

export type ReportIssuePayload = {
  type: string;
  description: string;
};

export const apiSlice = createApi({
  reducerPath: 'felizdateApi',
  baseQuery: baseQueryWithPayload,
  tagTypes: ['Session', 'Profile', 'Matches', 'Messages', 'Options'],
  endpoints: (builder) => ({
    getSession: builder.query<SessionPayload, void>({
      query: () => ({ url: '/getUserSession/' }),
      providesTags: ['Session'],
    }),
    login: builder.mutation<SessionPayload, LoginRequest>({
      query: (body) => ({
        url: '/login/',
        method: 'POST',
        body: toFormBody(body),
      }),
      invalidatesTags: ['Session'],
    }),
    logout: builder.mutation<{ detail?: string }, void>({
      query: () => ({ url: '/logout/', method: 'POST' }),
      invalidatesTags: ['Session', 'Matches', 'Messages'],
    }),
    setStatus: builder.mutation<number, StatusRequest>({
      query: (body) => ({
        url: '/setStatus/',
        method: 'POST',
        body: toFormBody(body),
      }),
      invalidatesTags: ['Session'],
    }),
    setPosition: builder.mutation<{ longitude: number; latitude: number }, PositionRequest>({
      query: (body) => ({
        url: '/setPosition/',
        method: 'POST',
        body: toFormBody(body),
      }),
    }),
    reportIssue: builder.mutation<void, ReportIssuePayload>({
      query: (body) => ({
        url: '/reportIssue/',
        method: 'POST',
        body: toFormBody(body),
      }),
    }),
    getProfile: builder.query<{ profile: ProfileSummary }, number>({
      query: (profileId) => ({
        url: '/getProfile/',
        params: { id: profileId },
      }),
      providesTags: (_result, _error, arg) => [{ type: 'Profile', id: arg }],
    }),
    getOptions: builder.query<Record<string, unknown>, void>({
      query: () => ({ url: '/getOptions/' }),
      providesTags: ['Options'],
    }),
    getBestMatches: builder.query<PagedProfiles, void>({
      query: () => ({ url: '/getBestMatches/' }),
      providesTags: ['Matches'],
    }),
    searchProfiles: builder.query<PagedProfiles, SearchProfilesPayload>({
      query: (params) => ({
        url: '/searchProfiles/',
        method: 'POST',
        body: toFormBody({
          countPrPage: params.countPrPage ?? 21,
          pageNo: params.pageNo ?? 1,
          loggedIn: params.loggedIn ?? 'off',
          ...params,
        }),
      }),
      providesTags: ['Matches'],
    }),
    getConversation: builder.query<MessageEnvelope[], ConversationParams>({
      query: ({ profileId }) => ({
        url: '/getConversation/',
        params: { profileId },
      }),
      providesTags: (_result, _error, arg) => [{ type: 'Messages', id: arg.profileId }],
    }),
    getLatestMessages: builder.query<MessageEnvelope[], void>({
      query: () => ({ url: '/getLatestMessages/' }),
      providesTags: ['Messages'],
    }),
    getMessages: builder.query<MessageEnvelope[], void>({
      query: () => ({ url: '/getMessages/' }),
      providesTags: ['Messages'],
    }),
    sendMessage: builder.mutation<MessageEnvelope[], SendMessageRequest>({
      query: (body) => ({
        url: '/sendMessage/',
        method: 'POST',
        body: toFormBody(body),
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Messages', id: arg.toProfileId },
        'Messages',
      ],
    }),
    getCloseByProfiles: builder.query<ProfileSummary[] | undefined, void>({
      query: () => ({ url: '/getCloseByProfiles/' }),
      providesTags: ['Matches'],
    }),
  }),
});

export const {
  useGetSessionQuery,
  useLazyGetSessionQuery,
  useLoginMutation,
  useLogoutMutation,
  useSetStatusMutation,
  useSetPositionMutation,
  useReportIssueMutation,
  useGetProfileQuery,
  useGetOptionsQuery,
  useGetBestMatchesQuery,
  useLazySearchProfilesQuery,
  useGetConversationQuery,
  useGetLatestMessagesQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetCloseByProfilesQuery,
} = apiSlice;

