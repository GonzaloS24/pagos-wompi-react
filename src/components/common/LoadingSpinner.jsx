import { PuffLoader } from "react-spinners";
import PropTypes from "prop-types";

const LoadingSpinner = ({
  loading = true,
  size = 60,
  color = "#009ee3",
  speedMultiplier = 4,
  margin = 2,
  message = "",
  className = "",
  containerClass = "loader-container",
}) => {
  if (!loading) return null;

  return (
    <div className={`${containerClass} ${className}`}>
      <PuffLoader
        color={color}
        loading={loading}
        size={size}
        margin={margin}
        speedMultiplier={speedMultiplier}
      />
      {message && (
        <p className="loading-message mt-3 text-center text-muted">{message}</p>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  loading: PropTypes.bool,
  size: PropTypes.number,
  color: PropTypes.string,
  speedMultiplier: PropTypes.number,
  margin: PropTypes.number,
  message: PropTypes.string,
  className: PropTypes.string,
  containerClass: PropTypes.string,
};

export default LoadingSpinner;
