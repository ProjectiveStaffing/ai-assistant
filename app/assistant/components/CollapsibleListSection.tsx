'use client';

import { useState } from 'react';
import { PlusIcon } from '../_icons/Plus';
import { SidebarListItem } from './SidebarItem';
import { useReminders } from '../_hook/useReminders';
import { MinusIcon } from '../_icons/Minus';

interface CollapsibleListSectionProps {
  title: string;
  onListClick: () => void;
}

export default function CollapsibleListSection({ title, onListClick }: CollapsibleListSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { state } = useReminders();

  const myLists = state.lists.filter(list => !['all'].includes(list.id));

  return (
    <div className="flex-grow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-gray-400 text-sm uppercase tracking-wide hover:text-gray-200 transition"
      >
        <span className='uppercase'>{title}</span>
        {isOpen ? (
          <MinusIcon className="w-4 h-4" />
        ) : (
          <PlusIcon className="w-4 h-4" />
        )}
      </button>

      <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
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
