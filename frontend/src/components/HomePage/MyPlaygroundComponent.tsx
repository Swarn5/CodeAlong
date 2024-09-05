import React, { useState } from "react";
import { MdDelete, MdDeleteOutline, MdEdit } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { Playground } from "../../types";
import { capitalize, getTimePassed } from "../../utils/functions";
import { useNavigate } from "react-router-dom";

type FetchedPlayground = Omit<
  Playground,
  "code" | "input" | "participatedUsers"
>;

const MyPlaygroundComponent = ({
  playground,
  handleMyPlaygroundDelete,
}: {
  playground: FetchedPlayground;
  handleMyPlaygroundDelete: (playgroundId: string) => void;
}) => {
  const name = capitalize(playground.name);
  const language = capitalize(playground.language);
  const createdAt = playground.createdAt;
  const navigate = useNavigate();
  const timePassed = getTimePassed(createdAt);
  const roomId = playground.roomId;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    handleMyPlaygroundDelete(playground._id);
    setShowDeleteModal(false);
  };

  return (
    <>
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Playground</h3>
            <p className="pb-4 pt-2">Are you sure you want to delete?</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={
                handleDelete
              }>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        onClick={() => {
          navigate(`/playground/${roomId}`);
        }}
        className="card m-5 mx-2 w-72 h-36 flex flex-row justify-between border hover:cursor-pointer border-stone-800 shadow-md shadow-slate-600 transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-br from-zinc-950 to-slate-700"
      >
        <div className="p-2 justify-between flex flex-col">
          <div>
            <p className="text-left text-zinc-300 text-bold text-lg">{name}</p>
            <p className="text-sm pl-1 font-bold text-gray-500">{language}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{timePassed}</p>
          </div>
        </div>
        <div className="flex items-start ml-2 p-1">
          <button
            className="p-2"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
          >
            <MdDeleteOutline size={20} className="text-slate-200" />
          </button>
        </div>
      </div>
    </>
  );
};

export default MyPlaygroundComponent;
