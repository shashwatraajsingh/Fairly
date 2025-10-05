import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  calculateGroupBalances,
  simplifyDebts,
} from "~/server/utils/debtSimplification";

export const balanceRouter = createTRPCRouter({
  // Get balances for a group
  getByGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify user is member of group
      const member = await ctx.db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this group",
        });
      }

      // Get all unsettled expense splits
      const expenseSplits = await ctx.db.expenseSplit.findMany({
        where: {
          expense: {
            groupId: input.groupId,
          },
          settled: false,
        },
        include: {
          paidBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          owedBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Calculate balances
      const balances = calculateGroupBalances(expenseSplits);

      return balances;
    }),

  // Get simplified debts for a group
  getSimplifiedDebts: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify user is member of group
      const member = await ctx.db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this group",
        });
      }

      // Get all unsettled expense splits
      const expenseSplits = await ctx.db.expenseSplit.findMany({
        where: {
          expense: {
            groupId: input.groupId,
          },
          settled: false,
        },
        include: {
          paidBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          owedBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Calculate balances
      const balances = calculateGroupBalances(expenseSplits);

      // Simplify debts
      const simplifiedDebts = simplifyDebts(balances);

      return simplifiedDebts;
    }),

  // Record a settlement
  recordSettlement: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        fromId: z.string(),
        toId: z.string(),
        amount: z.number().positive(),
        currency: z.string().default("USD"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is member of group
      const member = await ctx.db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this group",
        });
      }

      // Verify both users are members
      const members = await ctx.db.groupMember.findMany({
        where: {
          groupId: input.groupId,
          userId: {
            in: [input.fromId, input.toId],
          },
        },
      });

      if (members.length !== 2) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Both users must be members of the group",
        });
      }

      // Create settlement record
      const settlement = await ctx.db.settlement.create({
        data: {
          groupId: input.groupId,
          fromId: input.fromId,
          toId: input.toId,
          amount: input.amount,
          currency: input.currency,
          notes: input.notes,
        },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          to: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Mark relevant expense splits as settled
      // Find all splits where fromId owes toId
      const splitsToSettle = await ctx.db.expenseSplit.findMany({
        where: {
          expense: {
            groupId: input.groupId,
          },
          paidById: input.toId,
          owedById: input.fromId,
          settled: false,
        },
        orderBy: {
          expense: {
            date: "asc",
          },
        },
      });

      let remainingAmount = input.amount;

      for (const split of splitsToSettle) {
        if (remainingAmount <= 0) break;

        if (split.amount <= remainingAmount) {
          // Fully settle this split
          await ctx.db.expenseSplit.update({
            where: { id: split.id },
            data: { settled: true },
          });
          remainingAmount -= split.amount;
        } else {
          // Partially settle - we'll leave it unsettled for simplicity
          // In a production app, you might want to split this into two records
          break;
        }
      }

      return settlement;
    }),

  // Get settlement history for a group
  getSettlements: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify user is member of group
      const member = await ctx.db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this group",
        });
      }

      const settlements = await ctx.db.settlement.findMany({
        where: {
          groupId: input.groupId,
        },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          to: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          settledAt: "desc",
        },
      });

      return settlements;
    }),
});
