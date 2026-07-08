type ResetModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export function ResetModal({ onCancel, onConfirm }: ResetModalProps) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h3>Reset world?</h3>
        <p>This will reset all your progress.</p>

        <div className="modal-actions">
          <button className="cancel" onClick={onCancel}>
            Cancel
          </button>

          <button className="danger" onClick={onConfirm}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
