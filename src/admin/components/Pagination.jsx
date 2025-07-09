/* eslint-disable react/prop-types */
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const Pagination = ({ totalItems }) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
      <div className="text-muted mb-2 mb-md-0">
        Mostrando {totalItems} de {totalItems} resultados
      </div>
      <nav>
        <ul className="pagination mb-0">
          <li className="page-item disabled">
            <a className="page-link" href="#">
              <BsChevronLeft />
            </a>
          </li>
          <li className="page-item active">
            <a
              className="page-link"
              href="#"
              style={{ backgroundColor: "#009ee3", borderColor: "#009ee3" }}
            >
              1
            </a>
          </li>
          <li className="page-item">
            <a className="page-link" href="#">
              <BsChevronRight />
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;