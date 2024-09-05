import React from "react";

const KickUserModal = ({
  handleKickUser,
  userId,
  setShowModal,
}:{
  handleKickUser: (userId : string) => void;
  userId: string;
  setShowModal: (value: boolean) => void;
}) => {
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Confirm Kick</h3>
        <p className="pb-4 pt-2">Are you sure you want to kick this user out?</p>
        <div className="modal-action">
          <button className="btn" onClick={
            () => setShowModal(false)
          }>
            Cancel
          </button>
          <button className="btn btn-error" onClick={
            () => handleKickUser(userId)
          }>
            Kick
          </button>
        </div>
      </div>
    </div>
  );
};

export default KickUserModal;
