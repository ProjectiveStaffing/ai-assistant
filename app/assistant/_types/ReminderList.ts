export interface ReminderList {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>; // Para los iconos SVG
  color: string;
  count: number; // Para el contador de recordatorios
  parentId?: string; // id de la lista padre, si existe
}