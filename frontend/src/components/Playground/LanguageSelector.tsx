import React from "react";

const Languages = [
    
]

const LanguageSelector = () => {
  return (
    <div className="flex items-end mb-2">
        <p className="text-sm font-thin pr-2 mb-3">Language : </p>
      <details className="dropdown ">
        <summary className="btn btn-sm m-1 px-8">Select</summary>
        <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <li>
            <a>Item 1</a>
          </li>
          <li>
            <a>Item 2</a>
          </li>
        </ul>
      </details>
    </div>
  );
};

export default LanguageSelector;
