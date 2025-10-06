import { type GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { authOptions } from "~/server/auth";
import { api } from "~/utils/api";
import CreateGroupModal from "~/components/CreateGroupModal";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: groups, isLoading } = api.group.getAll.useQuery();

  const handleGroupClick = (groupId: string) => {
    void router.push(`/group/${groupId}`);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-charcoal/10 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-taupe to-taupe-dark rounded-2xl shadow-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-taupe to-charcoal bg-clip-text text-transparent">Fairly</h1>
                <p className="text-sm text-charcoal/60">Hey, {session?.user?.name}! 👋</p>
              </div>
            </div>
            <button
              onClick={() => void signOut()}
              className="px-4 py-2 text-sm font-medium text-charcoal/70 hover:text-charcoal hover:bg-beige/30 rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-charcoal mb-1">Your Groups</h2>
            <p className="text-charcoal/60">Manage and track shared expenses</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center gap-2 px-6 py-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Group
          </button>
        </div>

        {/* Groups List */}
        <div>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-beige border-t-taupe"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => handleGroupClick(group.id)}
                  className="card-hover p-6 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-charcoal group-hover:text-taupe transition-colors">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-charcoal/60 mt-2 line-clamp-2">{group.description}</p>
                      )}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-beige to-taupe-light rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-xl">👥</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1.5 text-charcoal/70">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium">{group.members.length} members</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-charcoal/70">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="font-medium">{group._count.expenses} expenses</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-charcoal/10">
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 4).map((member) => (
                        <div
                          key={member.id}
                          className="w-9 h-9 rounded-full bg-gradient-to-br from-taupe to-taupe-dark border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md"
                          title={member.user.name ?? "Unknown"}
                        >
                          {member.user.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      ))}
                      {group.members.length > 4 && (
                        <div className="w-9 h-9 rounded-full bg-charcoal/80 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="flex-1"></div>
                    <svg className="w-5 h-5 text-taupe group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-beige to-taupe-light rounded-3xl shadow-xl flex items-center justify-center">
                  <span className="text-5xl">📊</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-3">No groups yet</h3>
              <p className="text-charcoal/60 mb-6 max-w-md mx-auto">Create your first group to start splitting expenses with friends and family!</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary px-8 py-3 text-lg"
              >
                Create Your First Group
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}
