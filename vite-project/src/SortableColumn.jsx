import { useSortable,arrayMove  } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskColumn from "./TaskColumn";

function SortableColumn(props) {
  const { id } = props;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, data: { type: "column" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Pass listeners as dragHandle */}
      <TaskColumn {...props} dragHandle={listeners} />
    </div>
  );
}

export default SortableColumn;
