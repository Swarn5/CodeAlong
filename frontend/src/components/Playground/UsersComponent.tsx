import React, { useState } from "react";
import { GoDotFill } from "react-icons/go";
import { User } from "../../types";
import KickUserModal from "./KickUserModal";

const UsersComponent = ({
  activeUsers,
  participatedUsers,
  ifOwner,
  ownerId,
  kickUser,
}: {
  activeUsers: Pick<User, "username" | "_id">[];
  participatedUsers: Pick<User, "username" | "_id">[];
  ifOwner: boolean;
  ownerId: string;
  kickUser: (userId: string) => void;
}) => {
  const inactiveUsers = participatedUsers.filter(
    (participatedUser) =>
      !activeUsers.some((activeUser) => activeUser._id === participatedUser._id)
  );

  const [showKickModal, setShowKickModal] = useState<boolean>(false);
  const [userIdToKick, setUserIdToKick] = useState<string | null>(null);

  const handleShowKickModal = (userId: string) => {
    setUserIdToKick(userId);
    setShowKickModal(true);
  };

  const handleKickUser = (userId: string) => {
    kickUser(userId);
    setShowKickModal(false);
    setUserIdToKick(null);
  };

  return (
    <>
      {showKickModal && userIdToKick && (
        <KickUserModal
          handleKickUser={handleKickUser}
          userId={userIdToKick}
          setShowModal={setShowKickModal}
        />
      )}
      <div className="w-full rounded-r-lg bg-cyan-900 flex-col flex justify-start md:flex md:min-w-64 md:w-64">
        <div>
          <p className="text-left m-3 text-black text-xl font-bold">
            Users Joined
          </p>
          <div className="h-px bg-black mx-5"></div>
        </div>
        <div className="mt-5">
          <p className="mx-3 my-1 text-black font-semibold">Active Users</p>
          <div className="flex flex-col bg-zinc-800 m-3  overflow-y-auto max-h-40 shadow-md rounded-md">
            {activeUsers.map((user, index) => (
              <div
                className="flex justify-between items-center pr-2"
                key={index}
              >
                <div className="flex items-center">
                  <GoDotFill className="text-green-500" />
                  <p key={index} className="mx-1 my-1 font-serif text-gray-300">
                    {user.username}
                  </p>
                </div>
                {ifOwner && user._id !== ownerId && (
                  <button
                    className="bg-red-800 btn-xs text-white px-2 rounded-md"
                    onClick={() => handleShowKickModal(user._id)}
                  >
                    Kick
                  </button>
                )}
                {!ifOwner && user._id === ownerId && (
                  <p className="text-cyan-500 text-xs">Owner</p>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mx-3 my-1 text-black font-semibold">Inactive Users</p>
          <div className="flex flex-col bg-zinc-800 m-3  overflow-y-auto max-h-40 shadow-md rounded-md ">
            {inactiveUsers.length > 0 ? (
              inactiveUsers.map((user, index) => (
                <p key={index} className="mx-3 my-1 font-serif text-gray-300">
                  {user.username}
                </p>
              ))
            ) : (
              <p className="mx-3 my-2 font-serif text-sm text-center text-gray-300">
                No Inactive Users
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersComponent;
