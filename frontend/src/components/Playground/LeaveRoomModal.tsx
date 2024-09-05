import React from "react";

const LeaveRoomModal = ({
 
  handleLeaveRoom,
  handleShowLeaveModal,
}:{
  
  handleLeaveRoom: () => void;
  handleShowLeaveModal: () => void;
}) => {
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Leave Playground</h3>
        <p className="pb-4 pt-2 ">All the active users in the playground wil be removed as well</p>
        <div className="modal-action">
          <button className="btn" onClick={
            handleShowLeaveModal
          }>
            Cancel
          </button>
          <button
            className="btn btn-error"
            onClick={
              handleLeaveRoom
            }
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveRoomModal;
