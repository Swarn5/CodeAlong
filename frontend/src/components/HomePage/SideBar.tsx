import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { v4 } from "uuid";
import useMutationApi from "../../hooks/useMutationApi";
import {
  useCreatePlaygroundMutation,
  useSendRequestMutation,
} from "../../redux/api/serverApi";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../socket/SocketContext";
import { toast } from "react-toastify";

const NewPlaygroundModalContent = () => {
  const [playgroundName, setPlaygroundName] = useState("");
  const [language, setLanguage] = useState("c++"); // Default language
  const [roomId, setRoomId] = useState("");
  const [createPlayground, { isLoadingOrFetching, isSuccess }] = useMutationApi(
    {
      apiHook: useCreatePlaygroundMutation,
      dispatchSuccess: true,
      successTitle: "Playground Created Successfully",
      successDescription: " ",
    }
  );
  const navigate = useNavigate();

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // Add your submit logic here
    console.log({
      playgroundName,
      language,
      roomId,
      code: "",
    });
    // Reset the form or close the modal as needed
    createPlayground({
      name: playgroundName,
      language,
      roomId,
      code: "",
      createdAt: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (isSuccess) {
      navigate(`/playground/${roomId}`);
    }
  }, [isSuccess, navigate]);

  const generateRoomId = () => {
    const newRoomId = v4();
    setRoomId(newRoomId);
  };

  return (
    <div>
      <h3 className="font-bold text-lg">New Playground</h3>
      <form className="py-4 pb-1">
        <div className="form-control">
          <input
            type="text"
            placeholder="Enter name"
            className="input input-bordered"
            value={playgroundName}
            onChange={(e) => setPlaygroundName(e.target.value)}
          />
        </div>
        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Language</span>
          </label>
          <select
            className="select select-bordered"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
            }}
          >
            <option value="c">C</option>
            <option value="c++">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>
        <label className="label  mt-3 ">
          <span className="label-text">Room ID</span>
        </label>
        <div className=" form-control mb-8 flex flex-row justify-between items-center">
          <div className="w-full">
            <input
              type="text"
              className="input input-bordered w-full"
              value={roomId}
              disabled
            />
          </div>
          <button
            type="button"
            className="btn bg-violet-600 px-2  ml-2"
            onClick={generateRoomId}
          >
            Generate
          </button>
        </div>
      </form>
      <div className="modal-action">
        <button onClick={handleSubmit} className="btn px-3 bg-violet-600">
          Create
        </button>
        <form method="dialog">
          <button className="btn">Close</button>
        </form>
      </div>
    </div>
  );
};

const JoinPlaygroundModalContent = () => {
  const [roomId, setRoomId] = useState("");
  const [sendRequest, { isLoadingOrFetching, isSuccess }] = useMutationApi({
    apiHook: useSendRequestMutation,
    dispatchSuccess: true,
    successTitle: "Request Sent",
    successDescription: " ",
  });
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    socket.on("rejectJoinRequest", () => {
      toast.error(
        <div>
          <h1>Request Rejected</h1>
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
    });
    socket.on("approveJoinRequest", () => {
      console.log("Request Accepted");
      toast.success(
        <div>
          <h1>Request Accepted</h1>
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
      navigate(`/playground/${roomId}`);
    });

    return () => {
      socket.off("rejectJoinRequest");
      socket.off("approveJoinRequest");
    };
  }, [socket, roomId, navigate]);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // Add your submit logic here
    console.log({
      roomId,
    });
    // Reset the form or close the modal as needed
    sendRequest({
      roomId,
    });
  };

  return (
    <div>
      <h3 className="font-bold text-lg">Join Playground</h3>
      <form className="py-4">
        <div className="form-control">
          <input
            type="text"
            placeholder="Enter Room ID"
            className="input input-bordered"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>
      </form>
      <div className="modal-action mt-4">
        <button onClick={handleSubmit} className="btn px-3 bg-violet-600">
          Request
        </button>
        <form method="dialog">
          <button className="btn">Close</button>
        </form>
      </div>
    </div>
  );
};

const SideBar = ({
  handleSidebarOpen,
  isSidebarOpen,
  setIsSidebarOpen,
  selectedPlayground,
  setSelectedPlayground,
  logoutApiFunction,
}: {
  handleSidebarOpen: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  selectedPlayground: string;
  setSelectedPlayground: (selectedPlayground: string) => void;
  logoutApiFunction: () => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onLogoutHandler = () => {
    console.log("Logout");
    logoutApiFunction();
  };

  return (
    <div
      className={`bg-violet-500 md:w-72 shadow-lg shadow-black z-40 flex flex-col justify-between h-full overflow-y-auto  ${
        isSidebarOpen ? "block w-full md:w-56" : "hidden md:flex"
      }`}
    >
      <div className="items-center">
        <p className="font-serif text-3xl tracking-tight text-center mt-8  text-black font-bold ">
          CodeAlong
        </p>
        <div className="flex flex-col mt-5">
          <button
            className={`${
              selectedPlayground === "my" ? "bg-violet-700" : "bg-violet-500"
            } text-white font-bold py-2 px-4 rounded-md mt-3 mx-2 hover:bg-violet-600 flex items-center justify-between`}
            onClick={() => {
              setSelectedPlayground("my");
              handleSidebarOpen();
            }}
          >
            My Playgrounds
            <MdOutlineKeyboardArrowRight className="text-white" />
          </button>
          <button
            className={`${
              selectedPlayground === "joined"
                ? "bg-violet-700"
                : "bg-violet-500"
            } text-white font-bold py-2 px-4 rounded-md mt-3 mx-2 hover:bg-violet-600 flex items-center justify-between`}
            onClick={() =>{
              setSelectedPlayground("joined");
              handleSidebarOpen();
            }}
          >
            Joined Playgrounds
            <MdOutlineKeyboardArrowRight className="text-white" />
          </button>
        </div>
        <p className="text-black font-serif font-bold ml-2 mt-5 text-center">
          Create
        </p>
        <div className="h-px bg-slate-700 mx-8 mt-2"></div>
        <div className="flex flex-col">
          <button
            className="btn mx-3 mt-5 rounded-full"
            onClick={() =>
              (document.getElementById("my_modal_1") as any).showModal()
            }
          >
            New Playground
          </button>
          <dialog id="my_modal_1" className="modal ">
            <div className="modal-box">
              <NewPlaygroundModalContent />
            </div>
          </dialog>
          <button
            className="btn mx-3 mt-3 rounded-full"
            onClick={() =>
              (document.getElementById("my_modal_2") as any).showModal()
            }
          >
            Join Playground
          </button>
          <dialog id="my_modal_2" className="modal ">
            <div className="modal-box">
              <JoinPlaygroundModalContent />
            </div>
          </dialog>
        </div>
      </div>
      <div></div>
      <div className="flex flex-col mt-3 mb-2">
        <div className="flex items-center justify-between mt-5">
          <div className="flex flex-1 items-center">
            <FaUser className="text-sm text-black ml-2 mr-1" />
            <p className="text-black font-serif font-bold max-w-1/2 text-sm lg:text-md break-words">
              Swarn Shekhar
            </p>
          </div>
          <button
            className="bg-violet-700 btn-sm text-white font-bold px-2 rounded-md my-2 mx-3 hover:bg-violet-600"
            onClick={onLogoutHandler}
          >
            <IoIosLogOut className="text-black" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
