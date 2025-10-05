import { createTRPCRouter } from "~/server/api/trpc";
import { groupRouter } from "~/server/api/routers/group";
import { expenseRouter } from "~/server/api/routers/expense";
import { balanceRouter } from "~/server/api/routers/balance";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  group: groupRouter,
  expense: expenseRouter,
  balance: balanceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
