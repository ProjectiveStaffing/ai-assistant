import React from "react";

export interface SidebarListItemProps {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  count: number;
}