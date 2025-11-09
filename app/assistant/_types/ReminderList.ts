export interface ReminderList {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  count: number; 
  parentId?: string;
}