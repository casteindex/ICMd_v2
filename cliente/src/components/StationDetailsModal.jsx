const StationDetailsModal = ({ station, operatingSystems, onClose }) => (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <section className="station-modal" role="dialog" aria-modal="true" aria-labelledby="station-details-title">
            <div className="modal-header">
                <div>
                    <p className="section-kicker">Estacion / Detalle</p>
                    <h2 id="station-details-title">{station.name}</h2>
                </div>
                <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar detalle">×</button>
            </div>
            <div className="station-detail-list">
                <div>
                    <span>Codigo</span>
                    <strong>{station.code}</strong>
                </div>
                <div>
                    <span>Ubicacion</span>
                    <strong>{station.location}</strong>
                </div>
                <div>
                    <span>Sistema operativo</span>
                    <strong>{operatingSystems[station.operatingSystem]}</strong>
                </div>
                <div>
                    <span>Ultima actualizacion</span>
                    <strong>{station.lastReport}</strong>
                </div>
                <div>
                    <span>CPU / Memoria</span>
                    <strong>{station.cpuPercent ?? '—'}% / {station.memoryPercent ?? '—'}%</strong>
                </div>
                <div>
                    <span>Estado</span>
                    <strong>{station.ignored ? 'Ignorada' : station.status}</strong>
                </div>
            </div>
            <div className="modal-actions"><button className="button button-primary" type="button" onClick={onClose}>Cerrar</button></div>
        </section>
    </div>
);

export default StationDetailsModal;