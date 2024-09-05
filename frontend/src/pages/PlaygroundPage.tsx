import React, { useEffect, useRef, useState } from "react";
import LanguageSelector from "../components/Playground/LanguageSelector";
import {
  IoMdDownload,
  IoMdInformationCircle,
  IoMdPeople,
  IoMdSettings,
  IoMdSave,
  IoMdCopy,
} from "react-icons/io";
import { VscVersions } from "react-icons/vsc";
import CodeEditor from "../components/Playground/CodeEditor";
import InformationComponent from "../components/Playground/InformationComponent";
import UsersComponent from "../components/Playground/UsersComponent";
import CheckpointsComponent from "../components/Playground/CheckpointsComponent";
import {
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useSocket } from "../socket/SocketContext";
import {
  useApproveRequestMutation,
  useCheckIfParticipatedQuery,
  useCodeExecutionMutation,
  useCreateCheckpointMutation,
  useGetCheckpointsQuery,
  useKickUserMutation,
  useLeavePlaygroundMutation,
  useRejectRequestMutation,
  useSavePlaygroundMutation,
} from "../redux/api/serverApi";
import useMutationApi from "../hooks/useMutationApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import useQueryApi from "../hooks/useQueryApi";
import { Checkpoint, Playground } from "../types";
import { capitalize } from "../utils/functions";

const PlaygroundPage = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [requestQueue, setRequestQueue] = useState<
    { username: string; roomId: string; userId: string }[]
  >([]);
  const editorContent = useRef<string>("");
  const [language, setLanguage] = useState<string>("");
  const { socket } = useSocket();
  const { roomId } = useParams<{ roomId: string }>();
  const { userId } = useSelector((state: any) => state.auth);
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [outputError, setOutputError] = useState<boolean>(false);
  const [runningCode, setRunningCode] = useState<boolean>(false);
  const [playgroundName, setPlaygroundName] = useState<string>("");
  const [playgroundId, setPlaygroundId] = useState<string>("");
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [usersActive, setUsersActive] = useState<
    {
      _id: string;
      username: string;
    }[]
  >([]);
  const [usersParticipated, setUsersParticipated] = useState<
    {
      _id: string;
      username: string;
    }[]
  >([]);

  const [approveRequest, { isLoadingOrFetching: approveLoading }] =
    useMutationApi({
      apiHook: useApproveRequestMutation,
    });
  const [rejectRequest, { isLoadingOrFetching: rejectLoading }] =
    useMutationApi({
      apiHook: useRejectRequestMutation,
    });
  const [
    codeExecution,
    { data: codeExecutionData, isLoadingOrFetching: codeExecutionLoading },
  ] = useMutationApi({
    apiHook: useCodeExecutionMutation,
  });
  const {
    data: playgroundData,
    isLoadingOrFetching: checkingLoading,
    isError,
    isSuccess,
  } = useQueryApi({
    apiHook: useCheckIfParticipatedQuery,
    params: { roomId },
  }) as {
    data: Playground;
    isLoadingOrFetching: boolean;
    isError: boolean;
    isSuccess: boolean;
  };
  const [
    leavePlayground,
    { isLoadingOrFetching: leaveLoading, isSuccess: leaveSuccess },
  ] = useMutationApi({
    apiHook: useLeavePlaygroundMutation,
  });
  const [kickUser, { isLoadingOrFetching: kickLoading }] = useMutationApi({
    apiHook: useKickUserMutation,
  });
  const { data: checkpointsData, isLoadingOrFetching: checkpointsLoading } =
    useQueryApi({
      apiHook: useGetCheckpointsQuery,
      params: { playgroundId: playgroundId.toString() },
      options: {
        skip: !playgroundId,
      },
    }) as {
      data: Checkpoint[];
      isLoadingOrFetching: boolean;
    };
  const [createCheckpoint, { isLoadingOrFetching: createCheckpointLoading }] =
    useMutationApi({
      apiHook: useCreateCheckpointMutation,
    });
  const [savePlayground, { isLoadingOrFetching: savePlaygroundLoading }] =
    useMutationApi({
      apiHook: useSavePlaygroundMutation,
      dispatchSuccess: true,
      successTitle: "Saved",
      successDescription: "Playground saved successfully",
    });

  const handleCreateCheckpoint = async (name: string) => {
    // console.log("creating checkpoint");
    // console.log("playground id", playgroundId);
    // console.log("editor content", editorContent.current);
    await createCheckpoint({
      name,
      playgroundId: playgroundId,
      code: editorContent.current,
    });
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId || "");
    toast.success(
      <div>
        <h3>Room Id copied to clipboard</h3>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      }
    );
  };

  const handleLeave = () => {
    leavePlayground({ roomId });
  };

  useEffect(() => {
    if (leaveSuccess) {
      navigate("/homePage");
    }
  }, [leaveSuccess]);

  const handleSave = () => {
    savePlayground({ playgroundId, code: editorContent.current });
  };

  const handleKickUser = (userId: string) => {
    kickUser({ roomId, userId });
  };

  const tabComponents: { [key: string]: JSX.Element } = {
    info: (
      <InformationComponent
        userId={userId}
        ownerId={playgroundData?.createdBy.toString()}
        handleLeave={handleLeave}
        name={playgroundName}
        handleCopy={handleCopyRoomId}
        handleSave={handleSave}
      />
    ),
    users: (
      <UsersComponent
        ownerId={playgroundData?.createdBy.toString()}
        ifOwner={playgroundData?.createdBy === userId}
        activeUsers={usersActive || []}
        participatedUsers={usersParticipated || []}
        kickUser={handleKickUser}
      />
    ),
    versions: (
      <CheckpointsComponent
        handleCreateChckpoint={handleCreateCheckpoint}
        checkpoints={checkpoints || []}
      />
    ),
    // Add more components as needed
  };

  const handleButtonClick = (tabName: string) => {
    if (selectedTab === tabName) {
      setSelectedTab(""); // Deselect the tab if it's already selected
    } else {
      setSelectedTab(tabName);
    }
  };

  const buttonClasses = (tabName: string) =>
    `mb-4 p-2 rounded transition duration-200 ease-in-out transform ${
      selectedTab === tabName
        ? "bg-cyan-900 text-white scale-105"
        : "bg-zinc-800 text-white hover:bg-cyan-600 hover:scale-105"
    }`;

  const handleRunCode = async () => {
    await codeExecution({
      code: editorContent.current,
      language,
      input,
      roomId,
    });
    console.log("code execution data", codeExecutionData);
  };

  const handleRequest = (approved: boolean) => { 
    const [currentRequest, ...remainingRequests] = requestQueue;
    setRequestQueue(remainingRequests);
    console.log("approving request", currentRequest);

    if (approved) {
      approveRequest({
        roomId: currentRequest.roomId,
        userId: currentRequest.userId,
      });
    } else {
      rejectRequest({
        roomId: currentRequest.roomId,
        userId: currentRequest.userId,
      });
    }
  };

  useEffect(() => {
    if (!checkpointsData) return;
    setCheckpoints(checkpointsData);
  }, [checkpointsData]);

  useEffect(() => {
    if (!playgroundData) return;
    
    
    setPlaygroundId(playgroundData._id);
    setUsersActive(playgroundData.activeUsers);
    setUsersParticipated(playgroundData.participatedUsers);
    // console.log("users active", usersActive);
    // console.log("users participated", usersParticipated);
    setPlaygroundName(playgroundData.name);
    setLanguage(playgroundData.language);
    editorContent.current = playgroundData.code;
    
  }, [playgroundData]);

  const handleCodeChange = (data: string) => {
    editorContent.current = data;
  };

  useEffect(() => {
    console.log("code execution data", codeExecutionData, codeExecutionLoading);
    if (codeExecutionData) {
      if (codeExecutionData.error) {
        setOutputError(true);
        setOutput(codeExecutionData.error);
      } else {
        setOutputError(false);
        setOutput(codeExecutionData.output);
      }
    }
  }, [codeExecutionData, codeExecutionLoading]);

  useEffect(() => {
    if (isError) {
      navigate("/homePage");
    }
  }, [isError]);

  // socket function handlers

  useEffect(() => {
    if (!socket || checkingLoading) return;

    const handleWantsToJoin = ({
      username,
      roomId,
      userId,
    }: {
      username: string;
      roomId: string;
      userId: string;
    }) => {
      setRequestQueue((prevQueue) => [
        ...prevQueue,
        { username, roomId, userId },
      ]);
      console.log("wants to join", username, roomId);
    };

    const handleUserJoined = ({
      username,
      userId,
    }: {
      username: string;
      userId: string;
    }) => {
      console.log("user joined", username);
      // console.log("setting initial code", editorContent.current, roomId);
      socket.emit("setInitialCode", { code: editorContent.current, roomId });
      if (checkingLoading && !isSuccess) return;
      setUsersActive((prevUsers) => [...prevUsers, { _id: userId, username }]);
      toast.success(
        <div>
          <h3>{username} has joined the room</h3>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
    };

    const handeLeaveRoom = ({
      username,
      userId,
    }: {
      username: string;
      userId: string;
    }) => {
      console.log("user left", username);
      setUsersActive((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );
      toast.error(
        <div>
          <h3>{username} has left the room</h3>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
    };

    const handleExecutingCode = () => {
      setRunningCode(true);
      const toastId = "executingCodeToast";
      toast.info(
        <div>
          <h3>Executing code...</h3>
        </div>,
        {
          toastId,
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
    };

    const handleExecutedCode = ({
      output,
      error,
    }: {
      output: string;
      error: string;
    }) => {
      setRunningCode(false);
      toast.dismiss("executingCodeToast");
      if (error) {
        setOutputError(true);
        setOutput(error);
      } else {
        setOutputError(false);
        setOutput(output);
      }
    };

    const handleRoomDeleted = () => {
      navigate("/homePage");
    };

    const handleUserKicked = ({
      roomId,
      userId,
      username,
    }: {
      roomId: string;
      userId: string;
      username: string;
    }) => {
      setUsersActive((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );
      setUsersParticipated((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );
    };

    const handleSelfKicked = () => {
      navigate("/homePage");
      toast.error(
        <div>
          <h3>You have been kicked out of the room</h3>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
    };

    const handleCheckpointCreated = ({
      username,
      userId: userIdfromSocket,
      checkpoint,
    }: {
      username: string;
      userId: string;
      checkpoint: Checkpoint;
    }) => {
      console.log("checkpoint created", checkpoint);
      setCheckpoints((prevCheckpoints) => [...prevCheckpoints, checkpoint]);

      if (userIdfromSocket === userId) return;
      toast.success(
        <div>
          <h3>{username} has created a checkpoint</h3>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
    };

    socket.on("wantsToJoin", handleWantsToJoin);
    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handeLeaveRoom);
    socket.on("executingCode", handleExecutingCode);
    socket.on("executedCode", handleExecutedCode);
    socket.on("roomDeleted", handleRoomDeleted);
    socket.on("kickedUser", handleUserKicked);
    socket.on("kicked", handleSelfKicked);
    socket.on("checkpointCreated", handleCheckpointCreated);

    return () => {
      socket.off("codeChange", handleCodeChange);
      socket.off("wantsToJoin", handleWantsToJoin);
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handeLeaveRoom);
      socket.off("executingCode", handleExecutingCode);
      socket.off("executedCode", handleExecutedCode);
      socket.off("roomDeleted", handleRoomDeleted);
      socket.off("kickedUser", handleUserKicked);
      socket.off("kicked", handleSelfKicked);
      socket.off("checkpointCreated", handleCheckpointCreated);
    };
  }, [socket, checkingLoading]);

  useEffect(() => {
    if (!socket) return;
    console.log("joining room");
    socket.emit("joinRoom", { roomId, userId });

    return () => {
      console.log("leaving room");
      leavePlayground({ roomId });
      socket.emit("leaveRoom", { roomId, userId });
    };
  }, [socket]);

  // let [value, setValue] = React.useState("");

  // // Block navigating elsewhere when data has been entered into the input
  // const blocker = useBlocker(
  //   ({ currentLocation, nextLocation }) =>
  //     value !== "" &&
  //     currentLocation.pathname !== nextLocation.pathname
  // );

  // const blocker = useBlocker(
  //   ({ currentLocation, nextLocation }:{
  //     currentLocation: any;
  //     nextLocation: any;
  //   }) =>
  //     currentLocation.pathname !== nextLocation.pathname && isSuccess
  // );

  const [activeSection, setActiveSection] = useState("codeEditor");

  return (
    <>
      {(checkingLoading || !isSuccess) && <LoadingSpinner />}

      <div
        className="flex min-h-screen overflow-auto "
        style={{ maxWidth: "100vw" }}
      >
        {/* Slim Sticky Sidebar */}
        <div className="min-w-14  bg-zinc-800 text-white flex flex-col items-center py-4 sticky top-0 gap-y-5 shadow-md z-50">
          <button
            className={buttonClasses("info")}
            onClick={() => handleButtonClick("info")}
          >
            <IoMdInformationCircle size={24} />
          </button>
          <button
            className={buttonClasses("users")}
            onClick={() => handleButtonClick("users")}
          >
            <IoMdPeople size={24} />
          </button>
          <button
            className={buttonClasses("versions")}
            onClick={() => handleButtonClick("versions")}
          >
            <VscVersions size={24} />
          </button>
        </div>
        {selectedTab && tabComponents[selectedTab]}
        <div
          className={`w-full h-full  ${
            selectedTab !== "" ? "hidden md:flex md:flex-col" : ""
          }`}
          style={{
            maxWidth:
              selectedTab !== "" ? "calc(100vw - 312px)" : "calc(100vw - 56px)",
          }}
        >
          <div className="w-full bg-zinc-800 flex justify-around py-2 lg:hidden">
            <button
              className={`btn btn-sm ${
                activeSection === "codeEditor" ? "btn-active" : ""
              }`}
              onClick={() => setActiveSection("codeEditor")}
            >
              Code Editor
            </button>
            <button
              className={`btn btn-sm ${
                activeSection === "inputOutput" ? "btn-active" : ""
              }`}
              onClick={() => setActiveSection("inputOutput")}
            >
              Input/Output
            </button>
          </div>
          <div className="w-full max-w-full flex ">
            <div
              className={`w-full resize-none p-10 pt-5 flex flex-col lg:w-4/6  ${
                activeSection === "codeEditor" ? "block" : "hidden"
              } lg:block lg:pt-10`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center mb-2">
                  <p className="text-sm font-thin pr-2 mb-2">Language : </p>
                  <p className="text-md font-bold mb-2">
                    {capitalize(language)}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <button
                    className="btn btn-sm"
                    onClick={handleRunCode}
                    disabled={codeExecutionLoading || runningCode}
                  >
                    {codeExecutionLoading || runningCode ? (
                      <span className="loading loading-dots loading-md"></span>
                    ) : (
                      "Run"
                    )}
                  </button>
                </div>
              </div>

              <div className="w-full shadow-md rounded-xl overflow-hidden">
                {socket && (
                  <CodeEditor
                    language={language}
                    roomId={roomId || ""}
                    editorContent={editorContent.current}
                    setEditorContent={handleCodeChange}
                  />
                )}
              </div>
            </div>
            <div
              className={`w-full p-10 pt-2 pb-7 flex flex-col min-h-screen  ${
                activeSection === "inputOutput" ? "block" : "hidden"
              } lg:block lg:w-2/6 lg:pl-0 lg:pt-10`}
            >
              <p className="text-left mb-3 mt-3 text-bold tracking-tight">
                Input :{" "}
              </p>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="rounded-xl border h-2/5 min-h-44 shadow-md border-sky-200 mb-4 p-3 resize-none overflow-y-auto w-full  bg-zinc-800"
                placeholder="Enter input here..."
              ></textarea>
              <div className="flex justify-between items-center">
                <p className="text-left mb-3 text-bold tracking-tight">
                  Output :{" "}
                </p>
                <button
                  className="btn btn-sm px-7 mb-3"
                  onClick={() => {
                    setOutput("");
                    setOutputError(false);
                  }}
                >
                  Clear
                </button>
              </div>

              <textarea
                value={output}
                className={`rounded-xl border h-2/5  min-h-44 shadow-md border-sky-200 p-3 resize-none overflow-y-auto w-full bg-zinc-900 ${
                  outputError ? "text-red-500" : "text-white"
                }`}
                readOnly
              ></textarea>
            </div>
          </div>
        </div>

        {requestQueue.length > 0 && (
          <div className="modal modal-open">
            <div className="modal-box">
              <div className="flex items-center">
                <h3 className="font-bold text-lg">
                  {requestQueue[0].username}
                </h3>
                <p className="ml-2"> wants to join the room.</p>
              </div>
              <div className="modal-action">
                <button
                  className="btn btn-primary"
                  onClick={() => handleRequest(true)}
                >
                  Approve
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleRequest(false)}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PlaygroundPage;
