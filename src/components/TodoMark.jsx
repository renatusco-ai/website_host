export default function TodoMark({ children }) {
  return <span className="todo-marker">{`[TODO: ${children}]`}</span>;
}
