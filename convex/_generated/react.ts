/* eslint-disable */
/**
 * Generated React hooks.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@0.1.10.
 * To regenerate, run `npx convex codegen`.
 * @module
 */

import type deal from "../deal";
import type getDealt from "../getDealt";
import type join from "../join";
import type ping from "../ping";
import type { OptimisticLocalStore as GenericOptimisticLocalStore } from "convex/browser";
import type { ClientMutation, ClientQuery } from "convex/server";

/**
 * A type describing your app's public Convex API.
 *
 * This `ConvexAPI` type includes information about the arguments and return
 * types of your app's query and mutation functions.
 *
 * This type should be used with type-parameterized classes like
 * `ConvexReactClient` to create app-specific types.
 */
export type ConvexAPI = {
  queries: {
    getDealt: ClientQuery<typeof getDealt>;
  };
  mutations: {
    deal: ClientMutation<typeof deal>;
    join: ClientMutation<typeof join>;
    ping: ClientMutation<typeof ping>;
  };
};

import { makeUseQuery, makeUseMutation, makeUseConvex } from "convex/react";

/**
 * Load a reactive query within a React component.
 *
 * This React hook contains internal state that will cause a rerender whenever
 * the query result changes.
 *
 * This relies on the {@link ConvexProvider} being above in the React component tree.
 *
 * @param name - The name of the query function.
 * @param args - The arguments to the query function.
 * @returns `undefined` if loading and the query's return value otherwise.
 */
export const useQuery = makeUseQuery<ConvexAPI>();

/**
 * Construct a new {@link ReactMutation}.
 *
 * Mutation objects can be called like functions to request execution of the
 * corresponding Convex function, or further configured with
 * [optimistic updates](https://docs.convex.dev/using/optimistic-updates).
 *
 * The value returned by this hook is stable across renders, so it can be used
 * by React dependency arrays and memoization logic relying on object identity
 * without causing rerenders.
 *
 * This relies on the {@link ConvexProvider} being above in the React component tree.
 *
 * @param name - The name of the mutation.
 * @returns The {@link ReactMutation} object with that name.
 */
export const useMutation = makeUseMutation<ConvexAPI>();

/**
 * Get the {@link ConvexReactClient} within a React component.
 *
 * This relies on the {@link ConvexProvider} being above in the React component tree.
 *
 * @returns The active {@link ConvexReactClient} object, or `undefined`.
 */
export const useConvex = makeUseConvex<ConvexAPI>();

/**
 * A view of the query results currently in the Convex client for use within
 * optimistic updates.
 */
export type OptimisticLocalStore = GenericOptimisticLocalStore<ConvexAPI>;
