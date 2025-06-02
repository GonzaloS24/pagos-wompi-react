import PropTypes from "prop-types";
import chateaLogo from "../../assets/";

const Header = ({
  title = "Chatea Pro",
  subtitle = "",
  showLogo = true,
  className = "",
  logoMaxWidth = "220px",
}) => {
  return (
    <header className={`header-component ${className}`}>
      <figure className="mb-4 text-center">
        {showLogo && (
          <img
            src={chateaLogo}
            alt="Chatea Logo"
            className="img-fluid chatea-logo"
            style={{ maxWidth: logoMaxWidth }}
          />
        )}

        {title && !showLogo && <h1 className="header-title">{title}</h1>}

        {subtitle && (
          <p className="header-subtitle text-muted mt-2">{subtitle}</p>
        )}
      </figure>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showLogo: PropTypes.bool,
  className: PropTypes.string,
  logoMaxWidth: PropTypes.string,
};

export default Header;
