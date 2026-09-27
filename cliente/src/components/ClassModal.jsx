const ClassModal = ({ form, formError, isEditing = false, onChange, onClose, onSubmit }) => (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <section className="station-modal" role="dialog" aria-modal="true" aria-labelledby="class-modal-title">
            <div className="modal-header">
                <div>
                    <p className="section-kicker">Gestion academica</p>
                    <h2 id="class-modal-title">{isEditing ? 'Editar clase' : 'Nueva clase'}</h2>
                </div>
                <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar modal">x</button>
            </div>
            <p className="modal-description">{isEditing ? 'Actualiza los datos de la clase.' : 'Registra una nueva clase.'}</p>
            <form className="station-form" onSubmit={onSubmit}>
                <label htmlFor="class-code">Codigo</label>
                <input id="class-code" name="code" value={form.code} onChange={onChange} placeholder="CCC312" required />
                <label htmlFor="class-name">Nombre</label>
                <input id="class-name" name="name" value={form.name} onChange={onChange} placeholder="Desarrollo Web" required />
                <label htmlFor="class-section">Seccion</label>
                <input id="class-section" name="section" value={form.section} onChange={onChange} placeholder="1401" required />
                <label htmlFor="class-location">Ubicacion</label>
                <input id="class-location" name="location" value={form.location} onChange={onChange} placeholder="Laboratorio 3/204" required />
                <label htmlFor="class-schedule">Horario</label>
                <input id="class-schedule" name="schedule" value={form.schedule} onChange={onChange} placeholder="Lunes y miercoles, 10:00 - 11:30" required />
                {isEditing && (
                    <label className="class-active-field" htmlFor="class-active">
                        <input id="class-active" name="active" type="checkbox" checked={form.active} onChange={onChange} />
                        Clase activa
                    </label>
                )}
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <div className="modal-actions">
                    <button className="modal-cancel" type="button" onClick={onClose}>Cancelar</button>
                    <button className="button button-primary" type="submit">{isEditing ? 'Guardar cambios' : 'Crear clase'}</button>
                </div>
            </form>
        </section>
    </div>
);

export default ClassModal;
