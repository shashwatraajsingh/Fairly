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
    <div className="min-h-screen bg-gray-50 bg-pattern">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-teal">Fairly</h1>
              <nav className="hidden md:flex items-center gap-6">
                <span className="text-sm font-medium text-charcoal border-b-2 border-teal pb-1">Groups</span>
                <span className="text-sm text-charcoal/60 hover:text-charcoal cursor-pointer">Activity</span>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-charcoal/70">{session?.user?.name}</span>
              <button
                onClick={() => void signOut()}
                className="text-sm text-charcoal/60 hover:text-charcoal"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-charcoal">Groups</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-teal hover:bg-teal-dark text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add group
          </button>
        </div>

        {/* Groups List */}
        <div>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-beige border-t-teal"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => handleGroupClick(group.id)}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:border-teal hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-charcoal">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{group.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>{group.members.length} members</span>
                    <span>{group._count.expenses} expenses</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {group.members.slice(0, 3).map((member) => (
                        <div
                          key={member.id}
                          className="w-7 h-7 rounded-full bg-teal border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                          title={member.user.name ?? "Unknown"}
                        >
                          {member.user.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      ))}
                      {group.members.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                          +{group.members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-charcoal mb-2">No groups yet</h3>
              <p className="text-gray-500 mb-4">Create a group to start tracking shared expenses</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-teal hover:bg-teal-dark text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Create your first group
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
