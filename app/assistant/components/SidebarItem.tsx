'use client'
import React from "react";
import { SidebarListItemProps } from "../_types/SidebarListItemProps";
import { useReminders } from "../_hook/useReminders";

export const SidebarListItem: React.FC<SidebarListItemProps> = ({ id, name, icon: Icon, color, count }) => {
  const { selectList, state } = useReminders();
  const isSelected = state.selectedListId === id;

  return (
    <div
      className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors duration-200
        ${isSelected ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
      onClick={() => selectList(id)}
    >
      <div className="flex items-center">
        <Icon className={`h-5 w-5 mr-2 ${color}`} />
        <span className={`text-white ${isSelected ? 'font-semibold' : ''}`}>{name}</span>
      </div>
      <span className="text-gray-400">{count}</span>
    </div>
  );
};
