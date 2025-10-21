import React from "react";

// Componente para una categoría de la barra lateral (Today, Scheduled, All, Flagged)
export interface SidebarCategoryProps {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  count: number;
}  

