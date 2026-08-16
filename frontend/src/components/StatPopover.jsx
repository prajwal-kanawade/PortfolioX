import './StatPopover.css'

// Hover popover for a stat tile. The tile itself needs the "stat-card-hoverable" class
// (handles position + the stacking-context fix - see StatPopover.css) and should render this
// as its last child. items is already-filtered/derived data; itemHref makes an item an
// external link, otherwise it's a button that calls onItemClick.
export default function StatPopover({ title, items, emptyText, onItemClick, itemHref, renderPrimary, renderSecondary }) {
  return (
    <div className="stat-popover">
      <div className="stat-popover-header">{title}</div>
      <div className="stat-popover-list">
        {items.length === 0 ? (
          <div className="stat-popover-empty">{emptyText}</div>
        ) : (
          items.map((item) => {
            const content = (
              <>
                <span className="stat-popover-primary">{renderPrimary(item)}</span>
                <span className="stat-popover-secondary">{renderSecondary(item)}</span>
              </>
            )
            return itemHref ? (
              <a
                key={item.id}
                href={itemHref(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="stat-popover-item"
              >
                {content}
              </a>
            ) : (
              <button key={item.id} className="stat-popover-item" onClick={() => onItemClick(item)}>
                {content}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
