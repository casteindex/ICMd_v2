const ConfirmModal = ({ stationName, onCancel, onConfirm }) => (
    <div className="modal-backdrop" role="presentation">
        <section className="station-modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-station-title" aria-describedby="delete-station-description">
            <p className="section-kicker">Accion irreversible</p>
            <h2 id="delete-station-title">¿Eliminar estacion?</h2>
            <p id="delete-station-description" className="modal-description">Se eliminara <strong>{stationName}</strong> de la clase. Esta accion no se puede deshacer</p>
            <div className="modal-actions">
                <button className="modal-cancel" type="button" onClick={onCancel}>Cancelar</button>
                <button className="modal-danger" type="button" onClick={onConfirm}>Eliminar estacion</button>
            </div>
        </section>
    </div>
);

export default ConfirmModal;