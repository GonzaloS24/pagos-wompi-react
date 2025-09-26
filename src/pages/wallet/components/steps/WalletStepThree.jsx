import PropTypes from "prop-types";
import { useState, useRef } from "react";

const WalletStepThree = ({ onVideoCompleted }) => {
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleVideoEnded = () => {
    setVideoCompleted(true);
    onVideoCompleted(true);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  // Auto-play cuando el componente se monta
  const handleVideoLoad = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  return (
    <div>
      <h5 className="text-center mb-4" style={{ color: "#009ee3" }}>
        Paso 3: Tutorial - Cómo incluir las notas
      </h5>

      <div
        style={{
          background: "#ffe6e6",
          border: "2px solid #ff9999",
          borderRadius: "10px",
          padding: "1.3rem",
          marginBottom: "1.5rem",
          boxShadow: "0 2px 8px rgba(255, 153, 153, 0.2)",
        }}
      >
        <div className="d-flex align-items-center mb-2">
          <span style={{ fontSize: "1.2rem", marginRight: "0.5rem" }}>🚨</span>
          <strong style={{ color: "#cc0000", fontSize: "1.1rem" }}>
            ¡IMPORTANTE! Incluye las notas en tu transferencia
          </strong>
        </div>
        <p
          style={{
            color: "#990000",
            margin: "0",
            fontSize: "0.95rem",
            lineHeight: "1.4",
          }}
        >
          Si incluyes las notas en el campo descripción o concepto de tu
          transferencia, tu plan se activará{" "}
          <span
            style={{
              color: "#006600",
              fontWeight: "600",
            }}
          >
            inmediatamente
          </span>
          . Sin ellas, puede demorar{" "}
          <span
            style={{
              color: "#cc0000",
              fontWeight: "600",
            }}
          >
            varios días <span style={{ fontSize: "1.2rem" }}>🚨</span>
          </span>
        </p>
      </div>

      {/* Video Tutorial */}
      <div
        style={{
          backgroundColor: "#e7f3ff",
          border: "1px solid #b8daff",
          color: "#0c5460",
          borderRadius: "15px",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div className="text-center mb-3">
          <h6 style={{ color: "#495057", marginBottom: "0.5rem" }}>
            Video Tutorial
          </h6>
          <small className="text-muted">
            Aprende a incluir el resumen del pago en las notas de la
            transferencia.
          </small>
        </div>

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "300px",
            borderRadius: "10px",
            overflow: "hidden",
            margin: 0,
          }}
        >
          <video
            ref={videoRef}
            width="100%"
            height="100%"
            controls
            onLoadedData={handleVideoLoad}
            onEnded={handleVideoEnded}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              margin: 0,
              padding: 0,
            }}
          >
            <source
              src="https://storage.googleapis.com/chateapro-cdn/PagoWallet.mp4"
              type="video/mp4"
            />
            Tu navegador no soporta el elemento de video.
          </video>

          {/* Overlay solo cuando el video no ha terminado Y no se está reproduciendo */}
          {!videoCompleted && !isPlaying && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  color: "white",
                  fontSize: "1.2rem",
                  textAlign: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  padding: "1rem",
                  borderRadius: "8px",
                }}
              >
                <i
                  className="bx bx-play-circle"
                  style={{
                    fontSize: "2rem",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                ></i>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

WalletStepThree.propTypes = {
  onVideoCompleted: PropTypes.func.isRequired,
};

export default WalletStepThree;
