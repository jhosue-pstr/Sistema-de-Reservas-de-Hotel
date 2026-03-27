import './DataTable.css';

interface Column {
  key: string;
  label: string;
}

interface ActionButton {
  label: string;
  variant: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'secondary';
  onClick: (item: any) => void;
  condition?: (item: any) => boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: ActionButton[];
}

export default function DataTable({ columns, data, actions }: DataTableProps) {
  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {actions && actions.length > 0 && <th className="text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-4">
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id || index}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {item[col.key] !== undefined && item[col.key] !== null
                      ? String(item[col.key])
                      : '-'}
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="text-center">
                    <div className="btn-group gap-2">
                      {actions.map((action, idx) => {
                        const isVisible = action.condition ? action.condition(item) : true;
                        if (!isVisible) return null;
                        return (
                          <button
                            key={idx}
                            className={`btn btn-sm btn-${action.variant}`}
                            onClick={() => action.onClick(item)}
                          >
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
