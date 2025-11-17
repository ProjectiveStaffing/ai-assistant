'use client'
import React, { useState } from 'react';
import { Message } from '../_types/Message';
import { GPTResponse } from '../_types/GTPResponse';
import { useReminders } from '../_hook/useReminders';
import { AZURE_ERROR_02, AZURE_ERROR_03, GREETING, WRITING } from '../../_constants/chatbot.cons';
import { PendingTask } from '../_types/PendingTask';
import { validateTaskData, getMissingFieldQuestion, seemsLikeDateResponse } from '../_utils/taskValidation';

import RemindersSection from './RemindersSection';
import ChatSection from './ChatSection';

interface ChatBoxProps {
  showReminders: boolean;
  onCloseReminders: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ showReminders, onCloseReminders }) => {
  const { state, addTaskWithRelationships } = useReminders();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: GREETING, sender: 'bot' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTask, setPendingTask] = useState<PendingTask | null>(null);

  const handleSendMessage = async (messageToSend: string) => {
    if (!messageToSend.trim()) return;

    const userMessage: Message = { id: Date.now(), text: messageToSend, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // CASO 1: Si hay una tarea pendiente esperando información
      if (pendingTask && pendingTask.missingFields.length > 0) {
        console.log('📋 Completando tarea pendiente con:', messageToSend);

        // Si el mensaje parece ser una fecha, completar directamente
        if (seemsLikeDateResponse(messageToSend) && pendingTask.missingFields.includes('dateToPerform')) {
          // Crear tarea con la fecha proporcionada
          const result = addTaskWithRelationships(
            pendingTask.taskName,
            pendingTask.peopleInvolved,
            pendingTask.taskCategory,
            messageToSend, // Usar el mensaje como fecha
            pendingTask.itemType,
            pendingTask.assignedTo
          );

          let responseText = '';
          if (result.action === 'updated') {
            responseText = `✏️ Perfecto, he actualizado la tarea "${result.taskName}" para ${messageToSend}.`;
          } else if (result.action === 'kept_existing') {
            responseText = `🛡️ Ya tienes una tarea similar "${result.taskName}" con más información. La he mantenido.`;
          } else {
            const itemTypeES = pendingTask.itemType === 'task' ? 'tarea' : pendingTask.itemType === 'project' ? 'proyecto' : 'hábito';
            responseText = `✅ Perfecto, ${itemTypeES} creada: "${pendingTask.taskName}" para ${messageToSend}.`;
          }

          const botMessage: Message = {
            id: Date.now() + 1,
            text: responseText,
            sender: 'bot',
          };
          setMessages(prev => [...prev, botMessage]);

          // Limpiar tarea pendiente
          setPendingTask(null);
          setIsLoading(false);
          return;
        }

        // Si no parece ser una fecha simple, reenviar a Azure para procesar
        // (puede ser algo más complejo como "la próxima semana")
      }

      // CASO 2: Procesamiento normal con Azure OpenAI
      console.log("useReminders:", state);
      const res = await fetch('http://localhost:8080/youtask/api/v0/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: messageToSend }),
      });

      const data: GPTResponse = await res.json();
      const { taskName, peopleInvolved, taskCategory, dateToPerform, itemType, assignedTo } = data.response;

      // Validar si tiene toda la información necesaria
      const validation = validateTaskData({
        taskName: taskName[0],
        dateToPerform,
        itemType: itemType[0],
        assignedTo
      });

      // CASO 3: Falta información crítica - Preguntar al usuario
      if (!validation.isValid) {
        console.log('⚠️ Falta información:', validation.missingFields);

        // Guardar como tarea pendiente
        const newPendingTask: PendingTask = {
          taskName: taskName[0],
          peopleInvolved,
          taskCategory: taskCategory[0],
          dateToPerform,
          itemType: itemType[0],
          assignedTo,
          missingFields: validation.missingFields,
          originalMessage: messageToSend
        };
        setPendingTask(newPendingTask);

        // Generar pregunta contextual
        const question = getMissingFieldQuestion(
          validation.missingFields[0],
          itemType[0],
          taskName[0]
        );

        const botMessage: Message = {
          id: Date.now() + 1,
          text: question,
          sender: 'bot',
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        return;
      }

      // CASO 4: Información completa - Crear tarea normalmente
      const result = addTaskWithRelationships(taskName[0], peopleInvolved, taskCategory[0], dateToPerform, itemType[0], assignedTo);

      // Personalizar mensaje según si se creó, actualizó o mantuvo
      let responseText = data.response?.modelResponse || '';

      if (result.action === 'updated') {
        const similarityPercent = Math.round((result.similarity || 0) * 100);
        responseText = `✏️ He actualizado la tarea existente "${result.taskName}" con la nueva información (similitud: ${similarityPercent}%).`;
      } else if (result.action === 'kept_existing') {
        const similarityPercent = Math.round((result.similarity || 0) * 100);
        responseText = `🛡️ Ya tienes una tarea similar "${result.taskName}" con más información. He mantenido la versión más completa (similitud: ${similarityPercent}%).`;
      } else {
        responseText = `✅ ${data.response?.modelResponse || 'Tarea creada exitosamente.'}`;
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botMessage]);

      // Limpiar tarea pendiente si había
      setPendingTask(null);

    } catch (ex) {
      console.error(AZURE_ERROR_02, ex);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: AZURE_ERROR_03,
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Indicador de conversación pendiente */}
      {pendingTask && !showReminders && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2 text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">💬</span>
            <span className="font-medium">
              Esperando información para: "{pendingTask.taskName}"
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
          {/* Botón para volver al chat */}
          <button
            onClick={onCloseReminders}
            className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
          >
            back
          </button>

          <RemindersSection onClose={function (): void {
                      throw new Error('Function not implemented.');
                  } } />
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
};

export default ChatBox;
