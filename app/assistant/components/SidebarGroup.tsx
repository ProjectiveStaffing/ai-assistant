'use client'
import React from "react";
import { SidebarListItemProps } from "../_types/SidebarListItemProps";
import { SidebarListItem } from "./SidebarItem";

interface SidebarGroupProps {
  groupName: string;
  items: SidebarListItemProps[];
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({ groupName, items }) => {
  return (
    <div className="mb-4">
      <h3 className="text-gray-400 uppercase text-xs font-bold mb-2 px-3">{groupName}</h3>
      <div className="space-y-1">
        {items.map(item => (
          <SidebarListItem key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};
