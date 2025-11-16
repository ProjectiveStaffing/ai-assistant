'use client';

import { useState } from 'react';
import { PlusIcon } from '../_icons/Plus';
import { SidebarListItem } from './SidebarItem';
import { useReminders } from '../_hook/useReminders';
import { MinusIcon } from '../_icons/Minus';

interface CollapsibleListSectionProps {
  title: string;
  onListClick: () => void;
  itemType?: string; // 'task', 'project', 'habit'
}

export default function CollapsibleListSection({ title, onListClick, itemType }: CollapsibleListSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { state } = useReminders();

  // Obtener la lista principal (tasks, projects, habits)
  const mainList = state.lists.find(list => list.id === itemType + 's');

  // Filtrar sublistas según el itemType
  const myLists = state.lists.filter(list => {
    // Excluir 'all' y las listas principales (tasks, projects, habits)
    if (['all', 'tasks', 'projects', 'habits'].includes(list.id)) {
      return false;
    }
    // Si hay itemType, filtrar por parentId
    if (itemType) {
      return list.parentId?.toLowerCase() === itemType.toLowerCase();
    }
    // Si no hay itemType, mostrar todas
    return true;
  });

  return (
    <div className="flex-grow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-gray-400 text-sm uppercase tracking-wide hover:text-gray-200 transition mb-2"
      >
        <span className='uppercase'>{title}</span>
        {isOpen ? (
          <MinusIcon className="w-4 h-4" />
        ) : (
          <PlusIcon className="w-4 h-4" />
        )}
      </button>

      <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        {/* Lista principal */}
        {mainList && (
          <div onClick={onListClick} className="mb-2">
            <SidebarListItem
              id={mainList.id}
              name={mainList.name}
              icon={mainList.icon}
              color={mainList.color}
              count={mainList.count}
            />
          </div>
        )}

        {/* Sublistas */}
        {myLists.map(list => (
          <div key={list.id} onClick={onListClick}>
            <SidebarListItem
              id={list.id}
              name={list.name}
              icon={list.icon}
              color={list.color}
              count={list.count}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
