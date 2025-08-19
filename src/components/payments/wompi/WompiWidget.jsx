import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { wompiService } from "../../../services/payments/wompi/wompiService";

const WompiWidget = ({
  paymentData,
  isVisible,
  onWidgetReady,
  shouldUpdate = false,
}) => {
  const containerRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initializeWidget = async () => {
      if (!containerRef.current || !isVisible || !paymentData) return;

      // Solo inicializar si es necesario
      if (!shouldUpdate && hasInitialized.current) return;

      try {
        const success = await wompiService.createPaymentWidget(
          containerRef.current,
          paymentData
        );

        if (success) {
          hasInitialized.current = true;
          onWidgetReady?.(true);
        } else {
          onWidgetReady?.(false);
        }
      } catch (error) {
        console.error("Error al inicializar widget de Wompi:", error);
        onWidgetReady?.(false);
      }
    };

    initializeWidget();
  }, [paymentData, isVisible, shouldUpdate, onWidgetReady]);

  // Reset cuando se oculta el widget
  useEffect(() => {
    if (!isVisible) {
      hasInitialized.current = false;
    }
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      id="wompi-button-container"
      style={{
        display: isVisible ? "block" : "none",
        visibility: isVisible ? "visible" : "hidden",
        minHeight: isVisible ? "50px" : "0",
      }}
    />
  );
};

WompiWidget.propTypes = {
  paymentData: PropTypes.shape({
    priceCOPCents: PropTypes.number.isRequired,
    reference: PropTypes.string.isRequired,
  }),
  isVisible: PropTypes.bool.isRequired,
  onWidgetReady: PropTypes.func,
  shouldUpdate: PropTypes.bool,
};

export default WompiWidget;
