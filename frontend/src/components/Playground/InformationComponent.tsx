import React, { useState } from "react";
import LeaveRoomModal from "./LeaveRoomModal";

const InformationComponent = ({
  name,
  handleCopy,
  handleSave,
  handleLeave,
  ownerId,
  userId,
}: {
  name: string;
  handleCopy: () => void;
  handleSave: () => void;
  handleLeave: () => void;
  ownerId: string;
  userId: string;
}) => {

  const [showLeaveModal , setShowLeaveModal] = useState(false);
  

  return (
    <>
    {
      showLeaveModal && (userId === ownerId) &&
      <LeaveRoomModal 
        handleLeaveRoom={handleLeave}
        handleShowLeaveModal={()=>setShowLeaveModal(false)}
      />
    }
      <div className="w-full rounded-r-lg bg-cyan-900 flex-col flex  md:flex md:min-w-64 md:w-64" >
        <div>
          <p className="text-left m-3 text-black text-xl font-bold">{name}</p>
          <div className="h-px bg-black mx-5"></div>
        </div>

        <div className="flex flex-col">
          <button className="btn-md btn m-3" onClick={handleCopy}>
            Copy Room Id
          </button>
          {ownerId === userId && <button className="btn-md btn m-3 mt-0" onClick={handleSave}>
            Save Playground
          </button>}
          <button className="btn-md btn m-3 mt-0" onClick={
            ()=>setShowLeaveModal(true)
          }>
            Leave Playground
          </button>
        </div>
      </div>
    </>
  );
};

export default InformationComponent;
