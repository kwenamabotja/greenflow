import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AddCreditsBody, AiDashboard, CarbonCalculateRequest, CarbonSavings, CarbonStats, CongestionPredictions, CreateWalletUserBody, CreditTransaction, DashboardSummary, DemandPredictions, GautrainDeparture, GpsPing, HealthStatus, LeaderboardEntry, ListHubsParams, PingResult, PowerArea, PowerOutagePredictions, PowerStatus, RoutePlanRequest, RoutePlanResult, RoutePrediction, RoutePredictionRequest, TransitFeed, TransitHub, VirtualTaxi, WalletUser } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns combined Gautrain schedule and active virtual taxi positions
 * @summary Unified multi-modal transit feed
 */
export declare const getGetTransitFeedUrl: () => string;
export declare const getTransitFeed: (options?: RequestInit) => Promise<TransitFeed>;
export declare const getGetTransitFeedQueryKey: () => readonly ["/api/transit/feed"];
export declare const getGetTransitFeedQueryOptions: <TData = Awaited<ReturnType<typeof getTransitFeed>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTransitFeed>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTransitFeed>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTransitFeedQueryResult = NonNullable<Awaited<ReturnType<typeof getTransitFeed>>>;
export type GetTransitFeedQueryError = ErrorType<unknown>;
/**
 * @summary Unified multi-modal transit feed
 */
export declare function useGetTransitFeed<TData = Awaited<ReturnType<typeof getTransitFeed>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTransitFeed>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns virtual taxi positions derived from clustered GPS pings
 * @summary Active virtual taxi clusters
 */
export declare const getGetVirtualTaxisUrl: () => string;
export declare const getVirtualTaxis: (options?: RequestInit) => Promise<VirtualTaxi[]>;
export declare const getGetVirtualTaxisQueryKey: () => readonly ["/api/transit/virtual-taxis"];
export declare const getGetVirtualTaxisQueryOptions: <TData = Awaited<ReturnType<typeof getVirtualTaxis>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVirtualTaxis>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getVirtualTaxis>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetVirtualTaxisQueryResult = NonNullable<Awaited<ReturnType<typeof getVirtualTaxis>>>;
export type GetVirtualTaxisQueryError = ErrorType<unknown>;
/**
 * @summary Active virtual taxi clusters
 */
export declare function useGetVirtualTaxis<TData = Awaited<ReturnType<typeof getVirtualTaxis>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVirtualTaxis>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Submits a user GPS location ping; if 3+ users share a route, a virtual taxi is broadcast
 * @summary Submit GPS ping from commuter
 */
export declare const getSendGpsPingUrl: () => string;
export declare const sendGpsPing: (gpsPing: GpsPing, options?: RequestInit) => Promise<PingResult>;
export declare const getSendGpsPingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendGpsPing>>, TError, {
        data: BodyType<GpsPing>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendGpsPing>>, TError, {
    data: BodyType<GpsPing>;
}, TContext>;
export type SendGpsPingMutationResult = NonNullable<Awaited<ReturnType<typeof sendGpsPing>>>;
export type SendGpsPingMutationBody = BodyType<GpsPing>;
export type SendGpsPingMutationError = ErrorType<unknown>;
/**
 * @summary Submit GPS ping from commuter
 */
export declare const useSendGpsPing: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendGpsPing>>, TError, {
        data: BodyType<GpsPing>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendGpsPing>>, TError, {
    data: BodyType<GpsPing>;
}, TContext>;
/**
 * Returns current Gautrain departure schedule with partner API 2026 data
 * @summary Gautrain GTFS schedule
 */
export declare const getGetGautrainScheduleUrl: () => string;
export declare const getGautrainSchedule: (options?: RequestInit) => Promise<GautrainDeparture[]>;
export declare const getGetGautrainScheduleQueryKey: () => readonly ["/api/transit/gautrain"];
export declare const getGetGautrainScheduleQueryOptions: <TData = Awaited<ReturnType<typeof getGautrainSchedule>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGautrainSchedule>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getGautrainSchedule>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetGautrainScheduleQueryResult = NonNullable<Awaited<ReturnType<typeof getGautrainSchedule>>>;
export type GetGautrainScheduleQueryError = ErrorType<unknown>;
/**
 * @summary Gautrain GTFS schedule
 */
export declare function useGetGautrainSchedule<TData = Awaited<ReturnType<typeof getGautrainSchedule>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGautrainSchedule>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns Eskom/City Power load reduction schedule and active outage areas
 * @summary Current load reduction status
 */
export declare const getGetPowerStatusUrl: () => string;
export declare const getPowerStatus: (options?: RequestInit) => Promise<PowerStatus>;
export declare const getGetPowerStatusQueryKey: () => readonly ["/api/power/status"];
export declare const getGetPowerStatusQueryOptions: <TData = Awaited<ReturnType<typeof getPowerStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPowerStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPowerStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPowerStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getPowerStatus>>>;
export type GetPowerStatusQueryError = ErrorType<unknown>;
/**
 * @summary Current load reduction status
 */
export declare function useGetPowerStatus<TData = Awaited<ReturnType<typeof getPowerStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPowerStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns areas currently under load reduction with routing friction penalty scores
 * @summary Affected areas with friction penalties
 */
export declare const getGetPowerAreasUrl: () => string;
export declare const getPowerAreas: (options?: RequestInit) => Promise<PowerArea[]>;
export declare const getGetPowerAreasQueryKey: () => readonly ["/api/power/areas"];
export declare const getGetPowerAreasQueryOptions: <TData = Awaited<ReturnType<typeof getPowerAreas>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPowerAreas>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPowerAreas>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPowerAreasQueryResult = NonNullable<Awaited<ReturnType<typeof getPowerAreas>>>;
export type GetPowerAreasQueryError = ErrorType<unknown>;
/**
 * @summary Affected areas with friction penalties
 */
export declare function useGetPowerAreas<TData = Awaited<ReturnType<typeof getPowerAreas>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPowerAreas>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns optimal routes with load reduction friction penalties applied
 * @summary Plan a power-aware multi-modal route
 */
export declare const getPlanRouteUrl: () => string;
export declare const planRoute: (routePlanRequest: RoutePlanRequest, options?: RequestInit) => Promise<RoutePlanResult>;
export declare const getPlanRouteMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof planRoute>>, TError, {
        data: BodyType<RoutePlanRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof planRoute>>, TError, {
    data: BodyType<RoutePlanRequest>;
}, TContext>;
export type PlanRouteMutationResult = NonNullable<Awaited<ReturnType<typeof planRoute>>>;
export type PlanRouteMutationBody = BodyType<RoutePlanRequest>;
export type PlanRouteMutationError = ErrorType<unknown>;
/**
 * @summary Plan a power-aware multi-modal route
 */
export declare const usePlanRoute: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof planRoute>>, TError, {
        data: BodyType<RoutePlanRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof planRoute>>, TError, {
    data: BodyType<RoutePlanRequest>;
}, TContext>;
/**
 * Uses formula: Saved CO2 = (Dist × 120g) - (Dist × 35g)
 * @summary Calculate CO2 savings for a trip
 */
export declare const getCalculateCarbonSavingsUrl: () => string;
export declare const calculateCarbonSavings: (carbonCalculateRequest: CarbonCalculateRequest, options?: RequestInit) => Promise<CarbonSavings>;
export declare const getCalculateCarbonSavingsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof calculateCarbonSavings>>, TError, {
        data: BodyType<CarbonCalculateRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof calculateCarbonSavings>>, TError, {
    data: BodyType<CarbonCalculateRequest>;
}, TContext>;
export type CalculateCarbonSavingsMutationResult = NonNullable<Awaited<ReturnType<typeof calculateCarbonSavings>>>;
export type CalculateCarbonSavingsMutationBody = BodyType<CarbonCalculateRequest>;
export type CalculateCarbonSavingsMutationError = ErrorType<unknown>;
/**
 * @summary Calculate CO2 savings for a trip
 */
export declare const useCalculateCarbonSavings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof calculateCarbonSavings>>, TError, {
        data: BodyType<CarbonCalculateRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof calculateCarbonSavings>>, TError, {
    data: BodyType<CarbonCalculateRequest>;
}, TContext>;
/**
 * Returns top users ranked by cumulative CO2 savings
 * @summary Top CO2 savers leaderboard
 */
export declare const getGetCarbonLeaderboardUrl: () => string;
export declare const getCarbonLeaderboard: (options?: RequestInit) => Promise<LeaderboardEntry[]>;
export declare const getGetCarbonLeaderboardQueryKey: () => readonly ["/api/carbon/leaderboard"];
export declare const getGetCarbonLeaderboardQueryOptions: <TData = Awaited<ReturnType<typeof getCarbonLeaderboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCarbonLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCarbonLeaderboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCarbonLeaderboardQueryResult = NonNullable<Awaited<ReturnType<typeof getCarbonLeaderboard>>>;
export type GetCarbonLeaderboardQueryError = ErrorType<unknown>;
/**
 * @summary Top CO2 savers leaderboard
 */
export declare function useGetCarbonLeaderboard<TData = Awaited<ReturnType<typeof getCarbonLeaderboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCarbonLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns aggregate CO2 savings, total trips, and equivalent trees planted
 * @summary Platform-wide carbon saving statistics
 */
export declare const getGetCarbonStatsUrl: () => string;
export declare const getCarbonStats: (options?: RequestInit) => Promise<CarbonStats>;
export declare const getGetCarbonStatsQueryKey: () => readonly ["/api/carbon/stats"];
export declare const getGetCarbonStatsQueryOptions: <TData = Awaited<ReturnType<typeof getCarbonStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCarbonStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCarbonStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCarbonStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getCarbonStats>>>;
export type GetCarbonStatsQueryError = ErrorType<unknown>;
/**
 * @summary Platform-wide carbon saving statistics
 */
export declare function useGetCarbonStats<TData = Awaited<ReturnType<typeof getCarbonStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCarbonStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns POPIA-compliant list of registered Green Wallet users
 * @summary List Green Wallet users
 */
export declare const getListWalletUsersUrl: () => string;
export declare const listWalletUsers: (options?: RequestInit) => Promise<WalletUser[]>;
export declare const getListWalletUsersQueryKey: () => readonly ["/api/wallet/users"];
export declare const getListWalletUsersQueryOptions: <TData = Awaited<ReturnType<typeof listWalletUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listWalletUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listWalletUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListWalletUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listWalletUsers>>>;
export type ListWalletUsersQueryError = ErrorType<unknown>;
/**
 * @summary List Green Wallet users
 */
export declare function useListWalletUsers<TData = Awaited<ReturnType<typeof listWalletUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listWalletUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Creates POPIA-compliant Green Wallet identity with initial credits
 * @summary Register a new Green Wallet user
 */
export declare const getCreateWalletUserUrl: () => string;
export declare const createWalletUser: (createWalletUserBody: CreateWalletUserBody, options?: RequestInit) => Promise<WalletUser>;
export declare const getCreateWalletUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createWalletUser>>, TError, {
        data: BodyType<CreateWalletUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createWalletUser>>, TError, {
    data: BodyType<CreateWalletUserBody>;
}, TContext>;
export type CreateWalletUserMutationResult = NonNullable<Awaited<ReturnType<typeof createWalletUser>>>;
export type CreateWalletUserMutationBody = BodyType<CreateWalletUserBody>;
export type CreateWalletUserMutationError = ErrorType<unknown>;
/**
 * @summary Register a new Green Wallet user
 */
export declare const useCreateWalletUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createWalletUser>>, TError, {
        data: BodyType<CreateWalletUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createWalletUser>>, TError, {
    data: BodyType<CreateWalletUserBody>;
}, TContext>;
/**
 * @summary Get a wallet user by ID
 */
export declare const getGetWalletUserUrl: (userId: string) => string;
export declare const getWalletUser: (userId: string, options?: RequestInit) => Promise<WalletUser>;
export declare const getGetWalletUserQueryKey: (userId: string) => readonly [`/api/wallet/users/${string}`];
export declare const getGetWalletUserQueryOptions: <TData = Awaited<ReturnType<typeof getWalletUser>>, TError = ErrorType<unknown>>(userId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWalletUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWalletUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWalletUserQueryResult = NonNullable<Awaited<ReturnType<typeof getWalletUser>>>;
export type GetWalletUserQueryError = ErrorType<unknown>;
/**
 * @summary Get a wallet user by ID
 */
export declare function useGetWalletUser<TData = Awaited<ReturnType<typeof getWalletUser>>, TError = ErrorType<unknown>>(userId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWalletUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Awards credits for choosing multimodal paths over private cars
 * @summary Award Green Credits to a user
 */
export declare const getAddGreenCreditsUrl: (userId: string) => string;
export declare const addGreenCredits: (userId: string, addCreditsBody: AddCreditsBody, options?: RequestInit) => Promise<WalletUser>;
export declare const getAddGreenCreditsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addGreenCredits>>, TError, {
        userId: string;
        data: BodyType<AddCreditsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addGreenCredits>>, TError, {
    userId: string;
    data: BodyType<AddCreditsBody>;
}, TContext>;
export type AddGreenCreditsMutationResult = NonNullable<Awaited<ReturnType<typeof addGreenCredits>>>;
export type AddGreenCreditsMutationBody = BodyType<AddCreditsBody>;
export type AddGreenCreditsMutationError = ErrorType<unknown>;
/**
 * @summary Award Green Credits to a user
 */
export declare const useAddGreenCredits: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addGreenCredits>>, TError, {
        userId: string;
        data: BodyType<AddCreditsBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addGreenCredits>>, TError, {
    userId: string;
    data: BodyType<AddCreditsBody>;
}, TContext>;
/**
 * Returns recent Green Credit award history across all users
 * @summary List recent credit transactions
 */
export declare const getListTransactionsUrl: () => string;
export declare const listTransactions: (options?: RequestInit) => Promise<CreditTransaction[]>;
export declare const getListTransactionsQueryKey: () => readonly ["/api/wallet/transactions"];
export declare const getListTransactionsQueryOptions: <TData = Awaited<ReturnType<typeof listTransactions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTransactions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTransactions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTransactionsQueryResult = NonNullable<Awaited<ReturnType<typeof listTransactions>>>;
export type ListTransactionsQueryError = ErrorType<unknown>;
/**
 * @summary List recent credit transactions
 */
export declare function useListTransactions<TData = Awaited<ReturnType<typeof listTransactions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTransactions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns all transit hubs with geospatial data (Gautrain stations, Metrobus stops, Taxi Ranks)
 * @summary List all Gauteng transit hubs
 */
export declare const getListHubsUrl: (params?: ListHubsParams) => string;
export declare const listHubs: (params?: ListHubsParams, options?: RequestInit) => Promise<TransitHub[]>;
export declare const getListHubsQueryKey: (params?: ListHubsParams) => readonly ["/api/hubs", ...ListHubsParams[]];
export declare const getListHubsQueryOptions: <TData = Awaited<ReturnType<typeof listHubs>>, TError = ErrorType<unknown>>(params?: ListHubsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listHubs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listHubs>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListHubsQueryResult = NonNullable<Awaited<ReturnType<typeof listHubs>>>;
export type ListHubsQueryError = ErrorType<unknown>;
/**
 * @summary List all Gauteng transit hubs
 */
export declare function useListHubs<TData = Awaited<ReturnType<typeof listHubs>>, TError = ErrorType<unknown>>(params?: ListHubsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listHubs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get a single transit hub
 */
export declare const getGetHubUrl: (hubId: string) => string;
export declare const getHub: (hubId: string, options?: RequestInit) => Promise<TransitHub>;
export declare const getGetHubQueryKey: (hubId: string) => readonly [`/api/hubs/${string}`];
export declare const getGetHubQueryOptions: <TData = Awaited<ReturnType<typeof getHub>>, TError = ErrorType<unknown>>(hubId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHub>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getHub>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetHubQueryResult = NonNullable<Awaited<ReturnType<typeof getHub>>>;
export type GetHubQueryError = ErrorType<unknown>;
/**
 * @summary Get a single transit hub
 */
export declare function useGetHub<TData = Awaited<ReturnType<typeof getHub>>, TError = ErrorType<unknown>>(hubId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHub>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns key metrics for the GreenFlow platform dashboard
 * @summary Platform dashboard summary
 */
export declare const getGetDashboardSummaryUrl: () => string;
export declare const getDashboardSummary: (options?: RequestInit) => Promise<DashboardSummary>;
export declare const getGetDashboardSummaryQueryKey: () => readonly ["/api/dashboard/summary"];
export declare const getGetDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardSummary>>>;
export type GetDashboardSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Platform dashboard summary
 */
export declare function useGetDashboardSummary<TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns predicted traffic congestion levels across Gauteng
 * @summary AI-powered congestion predictions
 */
export declare const getGetCongestionPredictionsUrl: () => string;
export declare const getCongestionPredictions: (options?: RequestInit) => Promise<CongestionPredictions>;
export declare const getGetCongestionPredictionsQueryKey: () => readonly ["/api/ai/congestion"];
export declare const getGetCongestionPredictionsQueryOptions: <TData = Awaited<ReturnType<typeof getCongestionPredictions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCongestionPredictions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCongestionPredictions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCongestionPredictionsQueryResult = NonNullable<Awaited<ReturnType<typeof getCongestionPredictions>>>;
export type GetCongestionPredictionsQueryError = ErrorType<unknown>;
/**
 * @summary AI-powered congestion predictions
 */
export declare function useGetCongestionPredictions<TData = Awaited<ReturnType<typeof getCongestionPredictions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCongestionPredictions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns predicted demand for virtual taxis at key locations
 * @summary Virtual taxi demand predictions
 */
export declare const getGetDemandPredictionsUrl: () => string;
export declare const getDemandPredictions: (options?: RequestInit) => Promise<DemandPredictions>;
export declare const getGetDemandPredictionsQueryKey: () => readonly ["/api/ai/demand"];
export declare const getGetDemandPredictionsQueryOptions: <TData = Awaited<ReturnType<typeof getDemandPredictions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDemandPredictions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDemandPredictions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDemandPredictionsQueryResult = NonNullable<Awaited<ReturnType<typeof getDemandPredictions>>>;
export type GetDemandPredictionsQueryError = ErrorType<unknown>;
/**
 * @summary Virtual taxi demand predictions
 */
export declare function useGetDemandPredictions<TData = Awaited<ReturnType<typeof getDemandPredictions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDemandPredictions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns optimized route predictions with carbon impact analysis
 * @summary AI-powered route optimization
 */
export declare const getPredictRouteUrl: () => string;
export declare const predictRoute: (routePredictionRequest: RoutePredictionRequest, options?: RequestInit) => Promise<RoutePrediction>;
export declare const getPredictRouteMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof predictRoute>>, TError, {
        data: BodyType<RoutePredictionRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof predictRoute>>, TError, {
    data: BodyType<RoutePredictionRequest>;
}, TContext>;
export type PredictRouteMutationResult = NonNullable<Awaited<ReturnType<typeof predictRoute>>>;
export type PredictRouteMutationBody = BodyType<RoutePredictionRequest>;
export type PredictRouteMutationError = ErrorType<void>;
/**
 * @summary AI-powered route optimization
 */
export declare const usePredictRoute: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof predictRoute>>, TError, {
        data: BodyType<RoutePredictionRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof predictRoute>>, TError, {
    data: BodyType<RoutePredictionRequest>;
}, TContext>;
/**
 * Returns predicted load shedding events across Gauteng
 * @summary Power outage predictions
 */
export declare const getGetPowerOutagePredictionsUrl: () => string;
export declare const getPowerOutagePredictions: (options?: RequestInit) => Promise<PowerOutagePredictions>;
export declare const getGetPowerOutagePredictionsQueryKey: () => readonly ["/api/ai/power-outages"];
export declare const getGetPowerOutagePredictionsQueryOptions: <TData = Awaited<ReturnType<typeof getPowerOutagePredictions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPowerOutagePredictions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPowerOutagePredictions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPowerOutagePredictionsQueryResult = NonNullable<Awaited<ReturnType<typeof getPowerOutagePredictions>>>;
export type GetPowerOutagePredictionsQueryError = ErrorType<unknown>;
/**
 * @summary Power outage predictions
 */
export declare function useGetPowerOutagePredictions<TData = Awaited<ReturnType<typeof getPowerOutagePredictions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPowerOutagePredictions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns comprehensive AI-powered insights for platform operations
 * @summary AI insights dashboard
 */
export declare const getGetAiDashboardUrl: () => string;
export declare const getAiDashboard: (options?: RequestInit) => Promise<AiDashboard>;
export declare const getGetAiDashboardQueryKey: () => readonly ["/api/ai/dashboard"];
export declare const getGetAiDashboardQueryOptions: <TData = Awaited<ReturnType<typeof getAiDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAiDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAiDashboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAiDashboardQueryResult = NonNullable<Awaited<ReturnType<typeof getAiDashboard>>>;
export type GetAiDashboardQueryError = ErrorType<unknown>;
/**
 * @summary AI insights dashboard
 */
export declare function useGetAiDashboard<TData = Awaited<ReturnType<typeof getAiDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAiDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map