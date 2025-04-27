// @ts-check

/**
 * @param {unknown} value
 * @returns {value is { message: string }}
 */
function isErrorMessageObject(value) {
  return Boolean(
    value && "message" in /** @type {{ message?: string }} */ (value),
  );
}

/**
 * @param {unknown} value
 * @returns {Error | null}
 */
function fromMessageObject(value) {
  if (isErrorMessageObject(value)) {
    const error = new Error(value.message);
    return Object.assign(error, value);
  } else {
    return null;
  }
}

/**
 * @param {unknown} value
 * @returns {value is {}}
 */
function isObject(value) {
  return value !== null && typeof value === "object";
}

/**
 * @param {unknown} value
 * @returns {Error | null}
 */
function fromResponse(value) {
  if (value instanceof Response) {
    const message = `${value.status} ${value.statusText}`;
    return new Error(message);
  } else {
    return null;
  }
}

/**
 * @param {unknown} value
 * @param {Error} fallback
 * @returns {Error | null}
 */
function fromPrimitiveType(value, fallback) {
  if (value == null) {
    return fallback;
  }
  const type = typeof value;
  if (type === "string") {
    return new Error(type);
  } else if (Array.isArray(type) || type !== "object") {
    return fallback;
  } else {
    return null;
  }
}

/**
 * @param {unknown} value
 * @returns {Error | null}
 */
function fromKnownErrorInstance(value) {
  if (value instanceof Error) {
    return value;
  } else {
    return null;
  }
}

/**
 * Some APIs return objects like { error: { message: string } }
 * @param {unknown} value
 * @param {Error} fallback
 * @returns {Error | null}
 */
function fromRpcObject(value, fallback) {
  if (isObject(value) && "error" in value) {
    return (
      fromPrimitiveType(value.error, fallback) || fromMessageObject(value.error)
    );
  } else {
    return null;
  }
}

/**
 * @param {Error | unknown} value
 * @returns {Error}
 */
export function getError(value, fallback = new Error("Unknown Error")) {
  return (
    fromPrimitiveType(value, fallback) ||
    fromKnownErrorInstance(value) ||
    fromResponse(value) ||
    fromMessageObject(value) ||
    fromRpcObject(value, fallback) ||
    fallback
  );
}
