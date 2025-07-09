import { BsSearch } from "react-icons/bs";

const FiltersSection = () => {
  return (
    <div className="row mb-4">
      <div className="col-md-6 col-12 mb-2">
        <div className="input-group">
          <span className="input-group-text">
            <BsSearch />
          </span>
          <input
            type="text"
            className="form-control p-2 bg-white"
            placeholder="Buscar por email o workspace ID..."
          />
        </div>
      </div>
      <div className="col-md-3 col-6 mb-2">
        <select className="form-select p-2 bg-white">
          <option value="">Todos los estados</option>
          <option value="">Activo</option>
          <option value="">Cancelado</option>
          <option value="">Pendiente</option>
        </select>
      </div>
      <div className="col-md-3 col-6 mb-2">
        <select className="form-select p-2 bg-white">
          <option value="">10 por página</option>
          <option value="">20 por página</option>
          <option value="">50 por página</option>
        </select>
      </div>
    </div>
  );
};

export default FiltersSection;