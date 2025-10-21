'use client'
import React from "react";
import { SidebarCategoryProps } from "../_types/SidebarCategoryProps";
import { useReminders } from "../_hook/useReminders";

export const SidebarCategory: React.FC<SidebarCategoryProps> = ({ id, name, icon: Icon, color, count }) => {
  const { selectList, state } = useReminders();
  const isSelected = state.selectedListId === id;

  return (
    <div
      className={`flex flex-col justify-between p-4 rounded-lg cursor-pointer transition-colors duration-200
        ${isSelected ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
      onClick={() => selectList(id)}
    >
      <div className="flex justify-between items-center mb-2">
        <div className={`p-2 rounded-full ${isSelected ? 'bg-white bg-opacity-20' : `bg-gray-600`}`}>
          <Icon className={`h-6 w-6 ${color} ${isSelected ? 'text-white' : ''}`} />
        </div>
        <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-white'}`}>{count}</span>
      </div>
      <span className={`text-lg ${isSelected ? 'text-white' : 'text-gray-300'}`}>{name}</span>
    </div>
  );
};
