export const NO_TAXI_FOUND = (errorObj = {}) => ({
  errorObj,
  errorMessage: 'Nu a fost gasit niciun taxi cu acest numar de inmatriculare.',
  type: 'warning',
});

export const INVALID_REG_NO = (errorObj = {}) => ({
  errorObj,
  errorMessage: 'Numar de inmatriculare invalid.',
  type: 'error',
});

export const INVALID_CITY = (errorObj = {}) => ({
  errorObj,
  errorMessage: 'Oras invalid.',
  type: 'error',
});

export const EMPTY_REG_NO = (errorObj = {}) => ({
  errorObj,
  errorMessage: 'Numarul de inmatriculare este gol.',
  type: 'error',
});

export const EMPTY_FIELD = (field, errorObj = {}) => ({
  errorObj,
  errorMessage: `${field} este gol.`,
  type: 'error',
});

export const DATABASE_ERROR = (errorObj = {}) => ({
  errorObj,
  errorMessage: 'S-a produs o eroare cu baza de date.',
  type: 'error',
});

export const COULD_NOT_ADD_COMMENT_NOT_FOUND = (errorObj = {}) => ({
  errorObj,
  errorMessage:
    'Comentariul nu a fost adaugat deoarace un taxi cu acest numar nu a fost gasit.',
  type: 'error',
});

export const NO_COMMENTS_FOUND = (errorObj = {}) => ({
  errorObj,
  errorMessage: 'Nu a fost gasit niciun comentariu pentru acest taxi.',
  type: 'warning',
});

export const NO_RECENT_COMMENT = (errorObj = {}) => ({
  errorObj,
  errorMessage: 'Niciun commentariu recent gasit.',
  type: 'warning',
});

export const NO_CREDENTIALS_PROVIDED = (errorObj = {}) => ({
  errorObj,
  errorMessage: 'No credentials provided.',
  type: 'error',
});

export const API_CREDENTIALS_INVALID = (errorObj = {}) => ({
  errorObj,
  errorMessage: 'Invalid credentials provided.',
  type: 'error',
});

export const COMMENT_TOO_SOON = (errorObj = {}) => ({
  errorObj,
  errorMessage: 'Ai adaugat deja un comentariu recent.',
  type: 'error',
});

export const SUGGESTION_TOO_SOON = (errorObj = {}) => ({
  errorObj,
  errorMessage: 'Ai adaugat deja o sugestie recenta pentru acest taxi.',
  type: 'error',
});

export const USER_NOT_FOUND = (errorObj = {}) => ({
  errorObj,
  errorMessage: 'Userul nu a fost gasit in baza de date.',
  type: 'error',
});
