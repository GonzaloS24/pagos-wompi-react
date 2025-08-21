import referralApiInstance from "./index";

/**
 * Obtiene todos los tipos de documento de identidad nacional
 * [{
 *   name: string,
 *   description: string
 * }]
 */
export const getNationalIdentityNumberTypes = async () => {
  try {
    const response = await referralApiInstance.get(
      "/referral/national-identity-number-types"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching document types:", error);

    // Fallback a datos por defecto si la API falla
    return [
      {
        name: "CC",
        description: "Cédula de Ciudadanía",
      },
      {
        name: "NIT",
        description: "Número de Identificación Tributaria",
      },
      {
        name: "OTRO",
        description: "Otro documento",
      },
    ];
  }
};
