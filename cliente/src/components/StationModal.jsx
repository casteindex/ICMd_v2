//modal de formulario aparte para crear una nueva estacion
const StationModal = ({ classCode, operatingSystems, form, formError, isEditing = false, onChange, onClose, onSubmit }) => (
    
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <section className="station-modal" role="dialog" aria-modal="true" aria-labelledby="new-station-title">
            <div className="modal-header">
                <div>
                    <p className="section-kicker">Infraestructura</p>
                    <h2 id="new-station-title">{isEditing ? 'Editar estacion' : 'Nueva estacion'}</h2></div>
                <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar modal">×</button>
            </div>
            <p className="modal-description">{isEditing ? 'Actualiza los datos de la estacion' : `Registra una estacion para ${classCode || 'la clase seleccionada'}`}</p>
            <form className="station-form" onSubmit={onSubmit}>
                <label htmlFor="station-code">Codigo</label>
                <input id="station-code" name="code" value={form.code} onChange={onChange} placeholder="Nombre x" required />
                <label htmlFor="station-name">Nombre</label>
                <input id="station-name" name="name" value={form.name} onChange={onChange} placeholder="Estacion nueva" required />
                <label htmlFor="station-location">Ubicacion</label>
                <input id="station-location" name="location" value={form.location} onChange={onChange} placeholder="Fila F" required />
                <label htmlFor="station-os">Sistema operativo</label>
                <select id="station-os" name="operatingSystem" value={form.operatingSystem} onChange={onChange}>
                    {Object.entries(operatingSystems).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>

                {formError && <p className="form-error" role="alert">{formError}</p>}
                <div className="modal-actions"><button className="modal-cancel" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit">{isEditing ? 'Guardar cambios' : 'Crear estación'}</button></div>
            </form>
        </section>
    </div>
);

export default StationModal;