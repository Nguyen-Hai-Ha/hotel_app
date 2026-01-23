type Env = "production" | "development" | "test";

const evironment: Env = "development";

const getApiUrl = (env: Env) => {
  switch (env) {
    case "production":
      return "http://api.thesecret-hotel.com";
    case "development":
      return "http://127.0.0.1:8000";
    case "test":
      return "http://127.0.0.1:8000";
    default:
      return "http://127.0.0.1:8000";
  }
};

export const apiUrl = getApiUrl(evironment);
