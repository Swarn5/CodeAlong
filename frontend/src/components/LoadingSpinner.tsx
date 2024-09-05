import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-zinc-800" style={{zIndex:100}}>
      <span className="sr-only">Loading...</span>
      <div className="flex space-x-2 dark:invert">
        <div className="h-8 w-8 bg-zinc-800 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-8 w-8 bg-zinc-800 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-8 w-8 bg-zinc-800 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
