import PropTypes from "prop-types";

const WalletStepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="d-flex justify-content-center mb-3">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        return (
          <div key={step} className="d-flex align-items-center">
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center ${
                step <= currentStep ? "text-white" : "text-muted"
              }`}
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: step <= currentStep ? "#009ee3" : "#e9ecef",
                fontSize: "0.8rem",
                fontWeight: "bold",
              }}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div
                className="mx-2"
                style={{
                  width: "40px",
                  height: "2px",
                  backgroundColor: step < currentStep ? "#009ee3" : "#e9ecef",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

WalletStepIndicator.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
};

export default WalletStepIndicator;
