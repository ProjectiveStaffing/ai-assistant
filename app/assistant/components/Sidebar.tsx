'use client'
import React, { useState } from "react";
import { useReminders } from "../_hook/useReminders";
import CollapsibleListSection from "./CollapsibleListSection";
import { SearchIcon } from "../_icons/SearchIcon";

interface SidebarProps {
  onListClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onListClick }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
        <CollapsibleListSection title="tasks" onListClick={onListClick} />
      </aside>
    </>
  );
};
