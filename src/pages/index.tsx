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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-600">Fairly</h1>
              <p className="text-sm text-gray-600">Welcome, {session?.user?.name}</p>
            </div>
            <button
              onClick={() => void signOut()}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="mb-8">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            + Create Group
          </button>
        </div>

        {/* Groups List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Groups</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => handleGroupClick(group.id)}
                  className="card-hover p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{group.members.length} members</span>
                    <span>{group._count.expenses} expenses</span>
                  </div>

                  <div className="mt-4 flex -space-x-2">
                    {group.members.slice(0, 5).map((member) => (
                      <div
                        key={member.id}
                        className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-medium text-primary-600"
                        title={member.user.name ?? "Unknown"}
                      >
                        {member.user.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    ))}
                    {group.members.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                        +{group.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No groups yet. Create your first group to get started!</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
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
