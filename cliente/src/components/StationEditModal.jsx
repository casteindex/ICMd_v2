const StationEditModal = ({ form, formError, onChange, onClose, onSubmit }) => (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <section className="station-modal" role="dialog" aria-modal="true" aria-labelledby="edit-station-title">
            <div className="modal-header">
                <div>
                    <p className="section-kicker">Infraestructura</p>
                    <h2 id="edit-station-title">Editar estación</h2>
                </div>
                <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar modal">×</button>
            </div>
            <p className="modal-description">Actualiza únicamente la información operativa de la estación.</p>
            <form className="station-form" onSubmit={onSubmit}>
                <label htmlFor="edit-station-name">Nombre</label>
                <input id="edit-station-name" name="name" value={form.name} onChange={onChange} required />
                <label htmlFor="edit-station-location">Ubicación</label>
                <input id="edit-station-location" name="location" value={form.location} onChange={onChange} required />
                <label className="class-active-field" htmlFor="edit-station-ignored">
                    <input id="edit-station-ignored" name="ignored" type="checkbox" checked={form.ignored} onChange={onChange} />
                    Estación ignorada
                </label>
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <div className="modal-actions">
                    <button className="modal-cancel" type="button" onClick={onClose}>Cancelar</button>
                    <button className="button button-primary" type="submit">Guardar cambios</button>
                </div>
            </form>
        </section>
    </div>
);

export default StationEditModal;
