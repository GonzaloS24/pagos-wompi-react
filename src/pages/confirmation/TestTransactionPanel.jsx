import { TEST_MODES, startTransactionTest } from "../../utils/TransactionTester";

const TestTransactionPanel = () => {
  return (
    <div
      style={{
        padding: "15px",
        backgroundColor: "#edf4ff",
        border: "1px solid rgba(0, 158, 227, 0.2)",
        borderRadius: "8px",
        margin: "15px 0",
      }}
    >
      <h4
        style={{
          marginTop: 0,
          marginBottom: "10px",
          fontSize: "16px",
        }}
      >
        Panel de Pruebas de Transacción
      </h4>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <button
          onClick={() => startTransactionTest(TEST_MODES.PENDING_TO_APPROVED)}
          style={{
            padding: "8px 12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Probar: PENDING → APPROVED
        </button>

        <button
          onClick={() => startTransactionTest(TEST_MODES.ALWAYS_PENDING)}
          style={{
            padding: "8px 12px",
            backgroundColor: "#f0ad4e",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Probar: Siempre PENDING
        </button>

        <button
          onClick={() => startTransactionTest(TEST_MODES.ERROR)}
          style={{
            padding: "8px 12px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Probar: ERROR/DECLINED
        </button>
      </div>
    </div>
  );
};

export default TestTransactionPanel;
