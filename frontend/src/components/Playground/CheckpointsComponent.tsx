import React, { useEffect, useState } from "react";
import { Checkpoint } from "../../types";
import CheckpointModal from "./CheckpointModal";

const CheckpointsComponent = ({
  checkpoints,
  handleCreateChckpoint,
}: {
  checkpoints: Checkpoint[];
  handleCreateChckpoint: (name: string) => void;
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>();

  function formatDate(isoString: string) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    // Extract hours and minutes and format as HH:MM
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${month} ${day}, ${year}, ${time}`;
  }

  function sortCheckpoints(checkpoints: Checkpoint[]) {
    // Create a copy of the checkpoints array using the spread operator
    const checkpointsCopy = [...checkpoints];

    // Sort the copy of the array
    return checkpointsCopy.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  checkpoints = sortCheckpoints(checkpoints);
  console.log("here",checkpoints);
  return (
    <>
    {
      showCheckpointModal && (
        <CheckpointModal
          checkpoint={selectedCheckpoint as Checkpoint}
          setShowModal={setShowCheckpointModal}
        />
      )
    }
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add Checkpoint</h3>
            <div className="form-control mt-4">
              <input
                type="text"
                placeholder="Checkpoint Name"
                className="input input-bordered"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={() => {
                  handleCreateChckpoint(name);
                  setShowAddModal(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full rounded-r-lg bg-cyan-900 flex-col flex  md:flex md:min-w-64 md:w-64 justify-between">
        <div>
          <p className="text-left m-3 text-black text-xl font-bold">
            Checkpoints
          </p>
          <div className="h-px bg-black mx-5"></div>
        </div>
        <div className="mt-2">
          <div
            className="flex flex-col bg-zinc-800 m-3  overflow-y-auto shadow-md rounded-md"
            style={{ height: "75vh" }}
          >
            {checkpoints.length > 0 ? (
              checkpoints.map((checkpoint) => (
                <div
                  key={checkpoint._id}
                  className="flex flex-col p-3 border-b border-gray-500 shadow-md shadow-zinc-900 hover:cursor-pointer"
                  onClick={() => {
                    setSelectedCheckpoint(checkpoint);
                    setShowCheckpointModal(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-left text-zinc-300 text-md font-bold">
                      {checkpoint.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-left text-zinc-400 text-sm font-bold">
                      {checkpoint.createdBy.username}
                    </p>
                    <p className="text-left text-zinc-400 text-xs">
                      {formatDate(checkpoint.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-zinc-300 text-lg font-bold">
                  No checkpoints
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <button
            className="btn-md btn m-3 mt-0"
            onClick={() => setShowAddModal(true)}
          >
            Add Checkpoint
          </button>
        </div>
      </div>
    </>
  );
};

export default CheckpointsComponent;
