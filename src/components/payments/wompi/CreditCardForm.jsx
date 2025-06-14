import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "../../../styles/components/CreditCardForm.css";

const CreditCardForm = ({ onSubmit, loading = false, onCancel }) => {
  const [cardData, setCardData] = useState({
    cardName: "",
    cardNumber: "",
    cardMonth: "",
    cardYear: "",
    cardCvv: "",
  });

  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [focusElementStyle, setFocusElementStyle] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentCardBackground] = useState(Math.floor(Math.random() * 25 + 1));

  const minCardYear = new Date().getFullYear();
  const amexCardMask = "#### ###### #####";
  const otherCardMask = "#### #### #### ####";

  const cardNumberRef = useRef(null);
  const cardNameRef = useRef(null);
  const cardDateRef = useRef(null);
  const focusElementRef = useRef(null);

  useEffect(() => {
    if (cardNumberRef.current) {
      cardNumberRef.current.focus();
    }
  }, []);

  // Detectar tipo de tarjeta
  const getCardType = () => {
    const number = cardData.cardNumber;
    if (number.match(/^4/)) return "visa";
    if (number.match(/^(34|37)/)) return "amex";
    if (number.match(/^5[1-5]/)) return "mastercard";
    if (number.match(/^6011/)) return "discover";
    if (number.match(/^9792/)) return "troy";
    return "visa";
  };

  // Generar máscara de número
  const generateCardNumberMask = () => {
    return getCardType() === "amex" ? amexCardMask : otherCardMask;
  };

  // Mes mínimo permitido
  const minCardMonth = () => {
    if (parseInt(cardData.cardYear) === minCardYear) {
      return new Date().getMonth() + 1;
    }
    return 1;
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value) => {
    const mask = generateCardNumberMask();
    let formattedValue = "";
    let valueIndex = 0;

    for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
      if (mask[i] === "#") {
        formattedValue += value[valueIndex];
        valueIndex++;
      } else {
        formattedValue += mask[i];
      }
    }

    return formattedValue;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    let processedValue = value;

    if (field === "cardNumber") {
      // Solo números
      processedValue = value.replace(/\D/g, "");
      // Límite según tipo de tarjeta
      const maxLength = getCardType() === "amex" ? 15 : 16;
      processedValue = processedValue.slice(0, maxLength);
    } else if (field === "cardCvv") {
      // Solo números, máximo 4 dígitos
      processedValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (field === "cardName") {
      // Solo letras y espacios
      processedValue = value.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
    }

    setCardData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));

    // Validar mes si cambió el año
    if (field === "cardYear" && cardData.cardMonth) {
      if (parseInt(cardData.cardMonth) < minCardMonth()) {
        setCardData((prev) => ({
          ...prev,
          cardMonth: "",
        }));
      }
    }
  };

  // Manejar focus
  const handleFocus = (e) => {
    setIsInputFocused(true);
    const targetRef = e.target.dataset.ref;

    let target;
    if (targetRef === "cardNumber") target = cardNumberRef.current;
    else if (targetRef === "cardName") target = cardNameRef.current;
    else if (targetRef === "cardDate") target = cardDateRef.current;

    if (target) {
      setFocusElementStyle({
        width: `${target.offsetWidth}px`,
        height: `${target.offsetHeight}px`,
        transform: `translateX(${target.offsetLeft}px) translateY(${target.offsetTop}px)`,
      });
    }
  };

  // Manejar blur
  const handleBlur = () => {
    setTimeout(() => {
      if (!isInputFocused) {
        setFocusElementStyle(null);
      }
    }, 300);
    setIsInputFocused(false);
  };

  // Voltear tarjeta
  const flipCard = (status) => {
    setIsCardFlipped(status);
  };

  // Renderizar número de tarjeta
  const renderCardNumber = () => {
    const mask = generateCardNumberMask();
    const cardType = getCardType();
    const cardNumber = cardData.cardNumber;

    let numberIndex = 0;

    return mask
      .split("")
      .map((char, maskIndex) => {
        if (char === " ") {
          return (
            <span key={maskIndex} className="card-item__numberItem">
              {char}
            </span>
          );
        } else if (char === "#") {
          let displayChar = "#";
          const isActive = false;

          if (numberIndex < cardNumber.length) {
            const currentDigit = cardNumber[numberIndex];

            // Lógica para mostrar asteriscos en posiciones del medio
            const shouldHide =
              cardType === "amex"
                ? numberIndex >= 4 && numberIndex < 10 // Amex: ocultar posiciones 4-9
                : numberIndex >= 4 && numberIndex < 12; // Otras: ocultar posiciones 4-11

            displayChar = shouldHide ? "*" : currentDigit;
          }

          numberIndex++;

          return (
            <span
              key={maskIndex}
              className={`card-item__numberItem ${isActive ? "-active" : ""}`}
            >
              {displayChar}
            </span>
          );
        }

        return null;
      })
      .filter(Boolean);
  };

  // Validar formulario
  const validateForm = () => {
    const { cardName, cardNumber, cardMonth, cardYear, cardCvv } = cardData;

    if (!cardName.trim()) return false;
    if (!cardNumber || cardNumber.length < 13) return false;
    if (!cardMonth || !cardYear) return false;
    if (!cardCvv || cardCvv.length < 3) return false;

    return true;
  };

  // Manejar submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Por favor completa todos los campos correctamente");
      return;
    }

    // Preparar datos para envío
    const submitData = {
      number: cardData.cardNumber,
      exp_month: cardData.cardMonth.padStart(2, "0"),
      exp_year: cardData.cardYear,
      cvc: cardData.cardCvv,
      card_holder: cardData.cardName,
    };

    onSubmit(submitData);
  };

  return (
    <div className="credit-card-form">
      <div className="card-form">
        <div className="card-list">
          <div className={`card-item ${isCardFlipped ? "-active" : ""}`}>
            <div
              className={`card-item__focus ${
                focusElementStyle ? "-active" : ""
              }`}
              style={focusElementStyle || {}}
              ref={focusElementRef}
            ></div>

            {/* Lado frontal */}
            <div className="card-item__side -front">
              <div className="card-item__cover">
                <img
                  src={`https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/${currentCardBackground}.jpeg`}
                  className="card-item__bg"
                  alt="Card background"
                />
              </div>

              <div className="card-item__wrapper">
                <div className="card-item__top">
                  <img
                    src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/chip.png"
                    className="card-item__chip"
                    alt="Chip"
                  />
                  <div className="card-item__type">
                    {getCardType() && (
                      <img
                        src={`https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/${getCardType()}.png`}
                        className="card-item__typeImg"
                        alt={getCardType()}
                      />
                    )}
                  </div>
                </div>

                <label className="card-item__number" ref={cardNumberRef}>
                  {renderCardNumber()}
                </label>

                <div className="card-item__content">
                  <label className="card-item__info" ref={cardNameRef}>
                    <div className="card-item__holder">Card Holder</div>
                    <div className="card-item__name">
                      {cardData.cardName || "FULL NAME"}
                    </div>
                  </label>

                  <div className="card-item__date" ref={cardDateRef}>
                    <label className="card-item__dateTitle">Expires</label>
                    <label className="card-item__dateItem">
                      {cardData.cardMonth || "MM"}
                    </label>
                    /
                    <label className="card-item__dateItem">
                      {cardData.cardYear
                        ? String(cardData.cardYear).slice(2, 4)
                        : "YY"}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Lado trasero */}
            <div className="card-item__side -back">
              <div className="card-item__cover">
                <img
                  src={`https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/${currentCardBackground}.jpeg`}
                  className="card-item__bg"
                  alt="Card background"
                />
              </div>
              <div className="card-item__band"></div>
              <div className="card-item__cvv">
                <div className="card-item__cvvTitle">CVV</div>
                <div className="card-item__cvvBand">
                  {cardData.cardCvv.split("").map((_, index) => (
                    <span key={index}>*</span>
                  ))}
                </div>
                <div className="card-item__type">
                  {getCardType() && (
                    <img
                      src={`https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/${getCardType()}.png`}
                      className="card-item__typeImg"
                      alt={getCardType()}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="card-form__inner">
          <form onSubmit={handleSubmit}>
            <div className="card-input">
              <label className="card-input__label">Card Number</label>
              <input
                type="text"
                className="card-input__input"
                value={formatCardNumber(cardData.cardNumber)}
                onChange={(e) =>
                  handleInputChange(
                    "cardNumber",
                    e.target.value.replace(/\s/g, "")
                  )
                }
                onFocus={handleFocus}
                onBlur={handleBlur}
                data-ref="cardNumber"
                placeholder="1234 5678 9012 3456"
                disabled={loading}
              />
            </div>

            <div className="card-input">
              <label className="card-input__label">Card Holder</label>
              <input
                type="text"
                className="card-input__input"
                value={cardData.cardName}
                onChange={(e) => handleInputChange("cardName", e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                data-ref="cardName"
                placeholder="FULL NAME"
                disabled={loading}
              />
            </div>

            <div className="card-form__row">
              <div className="card-form__col">
                <div className="card-form__group">
                  <label className="card-input__label">Expiration Date</label>
                  <select
                    className="card-input__input -select"
                    value={cardData.cardMonth}
                    onChange={(e) =>
                      handleInputChange("cardMonth", e.target.value)
                    }
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    data-ref="cardDate"
                    disabled={loading}
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      const monthStr = month.toString().padStart(2, "0");
                      const isDisabled = month < minCardMonth();
                      return (
                        <option
                          key={month}
                          value={monthStr}
                          disabled={isDisabled}
                        >
                          {monthStr}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    className="card-input__input -select"
                    value={cardData.cardYear}
                    onChange={(e) =>
                      handleInputChange("cardYear", e.target.value)
                    }
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    data-ref="cardDate"
                    disabled={loading}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const year = minCardYear + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="card-form__col -cvv">
                <div className="card-input">
                  <label className="card-input__label">CVV</label>
                  <input
                    type="text"
                    className="card-input__input"
                    value={cardData.cardCvv}
                    onChange={(e) =>
                      handleInputChange("cardCvv", e.target.value)
                    }
                    onFocus={() => flipCard(true)}
                    onBlur={() => flipCard(false)}
                    maxLength="4"
                    placeholder="123"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="card-form__buttons">
              <button
                type="button"
                className="card-form__button -cancel"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="card-form__button -submit"
                disabled={loading || !validateForm()}
              >
                {loading ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

CreditCardForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
};

export default CreditCardForm;
