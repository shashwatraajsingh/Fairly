import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const expenseRouter = createTRPCRouter({
  // Create a new expense
  create: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        description: z.string().min(1).max(200),
        amount: z.number().positive(),
        currency: z.string().default("USD"),
        date: z.date().optional(),
        category: z.string().optional(),
        notes: z.string().optional(),
        paidById: z.string(),
        splitType: z.enum(["equal", "custom"]),
        splits: z.array(
          z.object({
            userId: z.string(),
            amount: z.number().positive(),
          })
        ),
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

      // Verify all split users are members
      const members = await ctx.db.groupMember.findMany({
        where: {
          groupId: input.groupId,
          userId: {
            in: input.splits.map((s) => s.userId),
          },
        },
      });

      if (members.length !== input.splits.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "All split users must be members of the group",
        });
      }

      // Verify splits sum to total amount
      const splitSum = input.splits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(splitSum - input.amount) > 0.01) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Split amounts must sum to total amount",
        });
      }

      // Create expense with splits
      const expense = await ctx.db.expense.create({
        data: {
          groupId: input.groupId,
          description: input.description,
          amount: input.amount,
          currency: input.currency,
          date: input.date ?? new Date(),
          category: input.category,
          notes: input.notes,
          createdById: ctx.session.user.id,
          splits: {
            create: input.splits.map((split) => ({
              paidById: input.paidById,
              owedById: split.userId,
              amount: split.amount,
            })),
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          splits: {
            include: {
              paidBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
              owedBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return expense;
    }),

  // Get all expenses for a group
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

      const expenses = await ctx.db.expense.findMany({
        where: {
          groupId: input.groupId,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          splits: {
            include: {
              paidBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
              owedBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      return expenses;
    }),

  // Update an expense
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().min(1).max(200).optional(),
        amount: z.number().positive().optional(),
        date: z.date().optional(),
        category: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get expense
      const expense = await ctx.db.expense.findUnique({
        where: { id: input.id },
      });

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      // Only creator can update
      if (expense.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the creator can update this expense",
        });
      }

      const updated = await ctx.db.expense.update({
        where: { id: input.id },
        data: {
          description: input.description,
          amount: input.amount,
          date: input.date,
          category: input.category,
          notes: input.notes,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          splits: {
            include: {
              paidBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
              owedBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return updated;
    }),

  // Delete an expense
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get expense
      const expense = await ctx.db.expense.findUnique({
        where: { id: input.id },
      });

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      // Only creator can delete
      if (expense.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the creator can delete this expense",
        });
      }

      await ctx.db.expense.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
