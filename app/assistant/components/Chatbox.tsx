'use client';

/**
 * Chat Box Component
 * Following BEST_PRACTICES.md:
 * - Component size < 250 lines
 * - Functions < 40 lines
 * - Organized imports
 * - No console.logs in production
 * - Separated concerns (messaging logic extracted)
 */

// External libraries
import React from 'react';

// Internal hooks
import { useReminders } from '../_hook/useReminders';
import { useTaskMessaging } from '../_hook/useTaskMessaging';

// Components
import RemindersSection from './RemindersSection';
import ChatSection from './ChatSection';

// Utils
import {
  validateTaskData,
  getMissingFieldQuestion,
} from '../_utils/taskValidation';
import {
  fetchTaskFromAPI,
  extractTaskData,
  generateTaskResponseMessage,
} from '../_utils/taskMessageProcessor';
import {
  handlePendingTaskCompletion,
  createPendingTaskObject,
} from '../_utils/messageHandlers';

// Constants
import { AZURE_ERROR_03 } from '../../_constants/chatbot.cons';

interface ChatBoxProps {
  showReminders: boolean;
  onCloseReminders: () => void;
}

export default function ChatBox({ showReminders, onCloseReminders }: ChatBoxProps) {
  const { addTaskWithRelationships } = useReminders();
  const {
    messages,
    pendingTask,
    isLoading,
    addUserMessage,
    addBotMessage,
    setPendingTask,
    setIsLoading,
  } = useTaskMessaging();

  const handleSendMessage = async (messageToSend: string): Promise<void> => {
    if (!messageToSend.trim()) return;

    addUserMessage(messageToSend);
    setIsLoading(true);

    try {
      // CASE 1: Handle pending task completion
      if (pendingTask && pendingTask.missingFields.length > 0) {
        const completionResult = handlePendingTaskCompletion(
          messageToSend,
          pendingTask,
          addTaskWithRelationships
        );

        if (!completionResult.shouldContinue && completionResult.responseText) {
          addBotMessage(completionResult.responseText);
          setPendingTask(null);
          setIsLoading(false);
          return;
        }
      }

      // CASE 2: Fetch task data from Azure API
      const data = await fetchTaskFromAPI(messageToSend);
      const taskData = extractTaskData(data);

      // CASE 3: Validate if all required information is present
      const validation = validateTaskData({
        taskName: taskData.taskName,
        dateToPerform: taskData.dateToPerform,
        itemType: taskData.itemType,
        assignedTo: taskData.assignedTo,
      });

      if (!validation.isValid) {
        // Create pending task and ask for missing information
        const newPendingTask = createPendingTaskObject(
          taskData.taskName,
          taskData.peopleInvolved,
          taskData.taskCategory,
          taskData.dateToPerform,
          taskData.itemType,
          taskData.assignedTo,
          validation.missingFields,
          messageToSend
        );
        setPendingTask(newPendingTask);

        const question = getMissingFieldQuestion(
          validation.missingFields[0],
          taskData.itemType,
          taskData.taskName
        );

        addBotMessage(question);
        setIsLoading(false);
        return;
      }

      // CASE 4: Create task with complete information
      const result = addTaskWithRelationships(
        taskData.taskName,
        taskData.peopleInvolved,
        taskData.taskCategory,
        taskData.dateToPerform,
        taskData.itemType,
        taskData.assignedTo
      );

      const responseText = generateTaskResponseMessage(
        result,
        null,
        data.response?.modelResponse
      );

      addBotMessage(responseText);
      setPendingTask(null);
    } catch (error) {
      if (error instanceof Error) {
        // Error logging could be sent to monitoring service
      }
      addBotMessage(AZURE_ERROR_03);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Pending conversation indicator */}
      {pendingTask && !showReminders && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2 text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">💬</span>
            <span className="font-medium">
              Esperando información para: &ldquo;{pendingTask.taskName}&rdquo;
            </span>
          </div>
          <button
            onClick={() => setPendingTask(null)}
            className="text-white hover:text-gray-200 font-bold text-lg"
            title="Cancelar"
          >
            ✕
          </button>
        </div>
      )}

      {showReminders ? (
        <div className="relative flex-1">
          <button
            onClick={onCloseReminders}
            className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
          >
            back
          </button>
          <RemindersSection
            onClose={() => {
              throw new Error('Function not implemented.');
            }}
          />
        </div>
      ) : (
        <ChatSection
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}
