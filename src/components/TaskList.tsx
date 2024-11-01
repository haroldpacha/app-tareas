import { Task } from '../App';
import { ShoppingCart, Wrench, AlertCircle, Check, Clock } from 'lucide-react';
import clsx from 'clsx';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Comprar':
      return <ShoppingCart className="w-5 h-5" />;
    case 'Hacer':
      return <Wrench className="w-5 h-5" />;
    default:
      return <AlertCircle className="w-5 h-5" />;
  }
};

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 3:
      return 'bg-red-100 text-red-800';
    case 2:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-green-100 text-green-800';
  }
};

const getPriorityLabel = (priority: number) => {
  switch (priority) {
    case 3:
      return 'Alta';
    case 2:
      return 'Media';
    default:
      return 'Baja';
  }
};

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
};

export default function TaskList({ tasks, onToggleTask }: TaskListProps) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={clsx(
            'flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm transition-all',
            task.completed && 'opacity-75'
          )}
        >
          <button
            onClick={() => task.id && onToggleTask(task.id)}
            className={clsx(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
              task.completed
                ? 'bg-indigo-600 border-indigo-600'
                : 'border-gray-300 hover:border-indigo-500'
            )}
          >
            {task.completed && <Check className="w-4 h-4 text-white" />}
          </button>

          <div className="flex-1">
            <h3
              className={clsx(
                'text-lg font-medium',
                task.completed && 'line-through text-gray-500'
              )}
            >
              {task.title}
            </h3>
            {(task.cost !== undefined || task.time !== undefined) && (
              <div className="flex gap-3 mt-1">
                {task.cost !== undefined && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    S/{' '}
                    {task.cost.toFixed(2)}
                  </div>
                )}
                {task.time !== undefined && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {formatTime(task.time)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span
              className={clsx(
                'px-2 py-1 rounded-md text-sm font-medium',
                getPriorityColor(task.priority)
              )}
            >
              {getPriorityLabel(task.priority)}
            </span>

            <div
              className={clsx(
                'flex items-center gap-1 px-3 py-1 rounded-md',
                {
                  'bg-blue-100 text-blue-800': task.category === 'Comprar',
                  'bg-purple-100 text-purple-800': task.category === 'Hacer',
                  'bg-gray-100 text-gray-800': task.category === 'Otros',
                }
              )}
            >
              {getCategoryIcon(task.category)}
              <span className="text-sm font-medium">{task.category}</span>
            </div>
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay tareas pendientes</p>
        </div>
      )}
    </div>
  );
}