'use client'
import React, { useState } from "react";
import { useReminders } from "../_hook/useReminders";
import { SidebarCategory } from "./SidebarCategory";
import { SearchIcon } from "../_icons/SearchIcon";
import { SidebarListItem } from "./SidebarItem";
import CollapsibleListSection from "./CollapsibleListSection";

export const Sidebar: React.FC = () => {
  const { state, addList } = useReminders();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 text-white fixed top-4 left-4 z-50 bg-gray-800 rounded-md"
      >
        <SearchIcon className="h-6 w-6" />
      </button>

      <aside
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-40
        w-64 sm:w-72 md:w-80
        bg-gray-800 p-4 h-screen overflow-y-auto flex flex-col rounded-l-xl
        md:relative md:translate-x-0 md:rounded-l-xl`} 
      >
        {/* <div className="relative mb-6 w-full">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-700 text-white rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
        </div> */}

        {/* <div className="grid grid-cols-2 gap-4 mb-8">
          {categories.map(cat => (
            <SidebarCategory
              key={cat.id}
              id={cat.id}
              name={cat.name === 'FlagIcon' ? 'Flagged' : cat.name}
              icon={cat.icon}
              color={cat.color}
              count={cat.count}
            />
          ))}
        </div> */}

        {/* <div className="mb-8 flex-grow">
          <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">tasks</h3>
          {myLists.map(list => (
            <SidebarListItem
              key={list.id}
              id={list.id}
              name={list.name}
              icon={list.icon}
              color={list.color}
              count={list.count}
            />
          ))}
        </div> */}

        <CollapsibleListSection title="tasks" />

      </aside>
    </>
  );
};