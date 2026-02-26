import { useEffect, useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import './DragToRank.css';

const QUESTION_TEXT = 'Put these in order of how your mind works naturally...';
const DEFAULT_ITEMS = ['Feel', 'Think', 'Make', 'Move'];

export function DragToRank({ logger, onAnswer }) {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const hasLoggedStartRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!hasLoggedStartRef.current) {
      logger.logEvent('question_start', 'q3');
      hasLoggedStartRef.current = true;
    }
  }, [logger]);

  const handleDragStart = (event) => {
    const itemId = event.active.id;
    logger.logEvent('drag_start', itemId);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);

    setItems(newItems);

    // Log drag_drop
    logger.logEvent('drag_drop', {
      item: active.id,
      position: newIndex,
    });

    // Log drag_reorder with current order
    logger.logEvent('drag_reorder', [...newItems]);

    // Call onAnswer with current order
    onAnswer(newItems);
  };

  return (
    <div className="drag-to-rank-card">
      <div className="dtr-header">
        <h2 className="dtr-question">{QUESTION_TEXT}</h2>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="dtr-items">
            {items.map((item, index) => (
              <SortableItem key={item} id={item} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
