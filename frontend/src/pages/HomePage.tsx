// useMutationApi, useQueryApi: Custom hooks for interacting with API endpoints, including deleting playgrounds, logging out, and fetching user data.

import React, { useEffect, useState } from "react";
import {
  useDeleteMyPlaygroundMutation,
  useDeleteParticipatedPlaygroundMutation,
  useGetJoinedPlaygroundsQuery,
  useGetYourPlaygroundsQuery,
  useLogoutMutation,
} from "../redux/api/serverApi";
import SideBar from "../components/HomePage/SideBar";
import useMutationApi from "../hooks/useMutationApi";
import MyPlaygroundComponent from "../components/HomePage/MyPlaygroundComponent";
import JoinedPlaygroundComponent from "../components/HomePage/JoinedPlaygroundComponent";
import useQueryApi from "../hooks/useQueryApi";
import { Playground } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSelector } from "react-redux";

// FetchedPlayground is a type that represents a playground object without the code, input, and participatedUsers fields.

type FetchedPlayground = Omit<
  Playground,
  "code" | "input" | "participatedUsers"
>;

const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPlayground, setSelectedPlayground] = useState("my");
  const [logout, { isLoadingOrFetching }] = useMutationApi({
    apiHook: useLogoutMutation,
    dispatchSuccess: true,
    successTitle: "Logged Out",
    successDescription: "You have been logged out successfully",
  });
  const [deleteMyPlayground , { isLoadingOrFetching : isDeleteMyPlaygroundLoading }] = useMutationApi({
    apiHook : useDeleteMyPlaygroundMutation,
    dispatchSuccess : true,
    successTitle : "Playground Deleted",
    successDescription : "Your playground has been deleted successfully"
  });
  const [deleteJoinedPlayground , { isLoadingOrFetching : isDeleteJoinedPlaygroundLoading }] = useMutationApi({ 
    apiHook : useDeleteParticipatedPlaygroundMutation,
    dispatchSuccess : true,
    successTitle : "Playground Deleted",
    successDescription : "You have been removed from the playground successfully"
  });

  const handleMyPlaygroundDelete = async (playgroundId : string) => {
    deleteMyPlayground({ playgroundId });
  }

  const handleJoinedPlaygroundDelete = async (playgroundId : string) => {
    deleteJoinedPlayground({ playgroundId });
  }

  // useEffect(() => {
  //   return () => {
  //     console.log("HomePage unmounted");
  //   }
  // }, []);

  const token = localStorage.getItem("token");
  // console.log(token);
  const {
    data: YourPlaygroundsData,
    isLoadingOrFetching: YourPlaygroundsIsLoadingOrFetching,
  } = useQueryApi({
    apiHook: useGetYourPlaygroundsQuery,
    options: {
      skip: token!==null ? false : true,
    },
  }) as { data: FetchedPlayground[]; isLoadingOrFetching: boolean };

  const {
    data: JoinedPlaygroundsData,
    isLoadingOrFetching: JoinedPlaygroundsIsLoadingOrFetching,
  } = useQueryApi({
    apiHook: useGetJoinedPlaygroundsQuery,
    options: {
      skip: token!==null ? false : true,
    },
  }) as { data: FetchedPlayground[]; isLoadingOrFetching: boolean };
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    logout();
    setShowLogoutModal(false);
  };

  //Get User Data
  // const { data : userData , isLoadingOrFetching : isUserDataLoading } = useQueryApi({
  //   apiHook: useGetUserDataQuery,
  // })

  // console.log(userData , isUserDataLoading);

  return (
    <>
      {isLoadingOrFetching ||
      YourPlaygroundsIsLoadingOrFetching ||
      JoinedPlaygroundsIsLoadingOrFetching ? (
        <LoadingSpinner />
      ) : null}
      <div className=" flex min-h-screen h-screen">
        {/* Hamburger Menu Button */}
        <div className="md:hidden flex justify-end p-4 bg-violet-400 hover:bg-violet-300 z-50 shadow-md shadow-black">
          <button
            className="text-black focus:outline-none"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>

        <SideBar
          handleSidebarOpen = {() => setIsSidebarOpen(!isSidebarOpen)}
          logoutApiFunction={handleLogoutClick}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          selectedPlayground={selectedPlayground}
          setSelectedPlayground={setSelectedPlayground}
        />
        {showLogoutModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Confirm Logout</h3>
              <p className="pb-4 pt-2">Are you sure you want to log out?</p>
              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-error" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className={` flex-1 overflow-y-auto scrollbar-thin     ${
            isSidebarOpen && "hidden md:block"
          }`}
        >
          <div className="pt-8 mx-4  flex flex-col h-full">
            <p className="font-bold font-serif text-3xl ml-7 text-zinc-200">
              {selectedPlayground === "my"
                ? "My Playgrounds"
                : "Joined Playgrounds"}
            </p>
            <div className="h-px bg-slate-700 mt-5"></div>
            <div className="h-full">
              <div className="w-full flex justify-center">
                {selectedPlayground === "my" ? (
                  YourPlaygroundsData?.length > 0 ? (
                    <div className="grid grid-cols-1 desktop:grid-cols-2 xl:grid-cols-3  gap-4 ">
                      {YourPlaygroundsData.map((playground) => (
                        <div
                          key={playground._id}
                          className="flex-grow-1 flex-shrink-0"
                        >
                          <MyPlaygroundComponent playground={playground} 
                          handleMyPlaygroundDelete={handleMyPlaygroundDelete}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center h-full items-center">
                      <p className="text-white text-3xl text-center mb-3 mt-20">
                        No saved playgrounds
                      </p>
                      <p>Start creating playgrounds to save them!</p>
                    </div>
                  )
                ) : JoinedPlaygroundsData?.length > 0 ? (
                  <div className="grid grid-cols-1 desktop:grid-cols-2 xl:grid-cols-3  gap-4 ">
                    {JoinedPlaygroundsData.map((playground) => (
                      <div
                        key={playground._id}
                        className="flex-grow-1 flex-shrink-0"
                      >
                        <JoinedPlaygroundComponent playground={playground} 
                          handleJoinedPlaygroundDelete={handleJoinedPlaygroundDelete}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col justify-center h-full items-center mt-20">
                    <p className="text-white text-3xl text-center mb-3">
                      No Joined playgrounds
                    </p>
                    <p>Join a playground and it will appear here!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
