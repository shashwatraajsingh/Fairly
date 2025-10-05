import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const groupRouter = createTRPCRouter({
  // Create a new group
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.db.group.create({
        data: {
          name: input.name,
          description: input.description,
          imageUrl: input.imageUrl,
          members: {
            create: {
              userId: ctx.session.user.id,
              role: "admin",
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return group;
    }),

  // Get all groups for current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const groups = await ctx.db.group.findMany({
      where: {
        members: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            expenses: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return groups;
  }),

  // Get a single group by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          expenses: {
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
          },
        },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      // Check if user is a member
      const isMember = group.members.some(
        (m) => m.userId === ctx.session.user.id
      );

      if (!isMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this group",
        });
      }

      return group;
    }),

  // Update group
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const member = await ctx.db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.id,
            userId: ctx.session.user.id,
          },
        },
      });

      if (!member || member.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update the group",
        });
      }

      const group = await ctx.db.group.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          imageUrl: input.imageUrl,
        },
      });

      return group;
    }),

  // Delete group
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const member = await ctx.db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.id,
            userId: ctx.session.user.id,
          },
        },
      });

      if (!member || member.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete the group",
        });
      }

      await ctx.db.group.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Add member to group
  addMember: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is member of the group
      const requesterMember = await ctx.db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (!requesterMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this group",
        });
      }

      // Find user by email
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if user is already a member
      const existingMember = await ctx.db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: user.id,
          },
        },
      });

      if (existingMember) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is already a member",
        });
      }

      // Add member
      const member = await ctx.db.groupMember.create({
        data: {
          groupId: input.groupId,
          userId: user.id,
          role: "member",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return member;
    }),

  // Remove member from group
  removeMember: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if requester is admin
      const requesterMember = await ctx.db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (!requesterMember || requesterMember.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can remove members",
        });
      }

      await ctx.db.groupMember.delete({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      });

      return { success: true };
    }),
});
