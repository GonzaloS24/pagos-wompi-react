import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../context/auth/UseAuth";
import chatea from "../../../assets/chatea.png";
import "../../../styles/components/Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "* El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "* El correo electrónico no es válido";
    }

    if (!formData.password) {
      newErrors.password = "* La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "* La contraseña debe tener al menos 6 caracteres";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    // Simular llamada a la API
    setTimeout(() => {
      login();
      setIsSubmitting(false);
      navigate("/admin-dashboard");
    }, 1500);
  };

  return (
    <main className="login">
      <figure className="login__img">
        <img src={chatea} alt="" />
      </figure>

      <form className="login__form" onSubmit={(e) => e.preventDefault()}>
        <h1 className="login__title">Iniciar sesión en Chatea Pro</h1>

        <fieldset className="login__formGroup">
          <label htmlFor="email">Correo electrónico</label>
          <input
            className="login__input"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
          />
          {errors.email && (
            <small className="login__error">{errors.email}</small>
          )}
        </fieldset>

        <fieldset className="login__formGroup">
          <label htmlFor="password">Contraseña</label>
          <input
            className="login__input"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña"
          />
          {errors.password && (
            <small className="login__error">{errors.password}</small>
          )}
        </fieldset>

        <button
          className="login__btn"
          type="button"
          onClick={handleSubmit}
          //   disabled={isSubmitting || !(dirty && isValid)}
        >
          {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>
    </main>
  );
};

export default Login;
