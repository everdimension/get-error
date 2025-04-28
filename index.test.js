// @ts-check
import { test, describe } from "node:test";
import assert from "node:assert";
import { getError } from "./index.js";

describe("getError", () => {
  // Basic JavaScript value types
  describe("primitive values", () => {
    test("should handle null", () => {
      const error = getError(null);
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Unknown Error");
    });

    test("should handle undefined", () => {
      const error = getError(undefined);
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Unknown Error");
    });

    test("should handle strings", () => {
      const errorMessage = "Something went wrong";
      const error = getError(errorMessage);
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, errorMessage);
    });

    test("should handle numbers", () => {
      const error = getError(42);
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Unknown Error");
    });

    test("should handle booleans", () => {
      const error = getError(true);
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Unknown Error");
    });

    test("should handle symbols", () => {
      const error = getError(Symbol("test"));
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Unknown Error");
    });

    test("should handle BigInt", () => {
      const error = getError(BigInt(123));
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Unknown Error");
    });
  });

  // Object types
  describe("object values", () => {
    test("should handle plain objects", () => {
      const error = getError({});
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Unknown Error");
    });

    test("should handle arrays", () => {
      const error = getError([1, 2, 3]);
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Unknown Error");
    });

    test("should handle objects with message property", () => {
      const errorObj = { message: "Custom error message" };
      const error = getError(errorObj);
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Custom error message");
    });

    test("should preserve additional properties from message objects", () => {
      const errorObj = {
        message: "Custom error message",
        code: "ERR_CUSTOM",
        details: { something: "important" },
      };
      const error = getError(errorObj);
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Custom error message");
      assert.ok("code" in error);
      assert.strictEqual(error.code, "ERR_CUSTOM");
      assert.ok("details" in error);
      assert.deepStrictEqual(error.details, { something: "important" });
    });
  });

  // Error instances
  describe("error instances", () => {
    test("should pass through Error instances unchanged", () => {
      const originalError = new Error("Original error");
      Object.assign(originalError, { code: "ORIGINAL_ERROR" });

      const error = getError(originalError);
      assert.strictEqual(error, originalError); // Should be the same instance
      assert.strictEqual(error.message, "Original error");
      assert.ok("code" in error);
      assert.strictEqual(error.code, "ORIGINAL_ERROR");
    });

    test("should handle Error subclasses", () => {
      class CustomError extends Error {
        constructor(message) {
          super(message);
          this.name = "CustomError";
        }
      }

      const originalError = new CustomError("Custom error type");
      const error = getError(originalError);

      assert.strictEqual(error, originalError);
      assert.strictEqual(error.name, "CustomError");
    });

    test("should handle DOMExceptions", () => {
      const exception = new DOMException("Dom Exception Message");
      const error = getError(exception);

      assert.strictEqual(error, exception); // Should be the same instance
      assert.strictEqual(error.message, "Dom Exception Message");
    });
  });

  // Response objects
  describe("Response objects", () => {
    test("should handle Response objects", () => {
      const response = new Response(null, {
        status: 404,
        statusText: "Not Found",
      });
      const error = getError(response);

      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "404 Not Found");
    });
  });

  // RPC-style error objects
  describe("RPC-style error objects", () => {
    test("should handle { error: string } objects", () => {
      const rpcError = { error: "Something failed" };
      const error = getError(rpcError);

      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Something failed");
    });

    test("should handle { error: { message: string } } objects", () => {
      const rpcError = { error: { message: "Nested error message" } };
      const error = getError(rpcError);

      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Nested error message");
    });

    test("should handle complex nested error objects", () => {
      const rpcError = {
        error: {
          message: "RPC failed",
          code: "INVALID_REQUEST",
          data: { reason: "Bad input" },
        },
      };
      const error = getError(rpcError);

      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "RPC failed");
      assert.ok("code" in error);
      assert.strictEqual(error.code, "INVALID_REQUEST");
      assert.ok("data" in error);
      assert.deepStrictEqual(error.data, { reason: "Bad input" });
    });
  });

  // Custom fallback
  describe("custom fallback errors", () => {
    test("should use provided fallback error", () => {
      const fallback = new Error("Custom fallback");
      const error = getError(null, fallback);

      assert.strictEqual(error, fallback);
      assert.strictEqual(error.message, "Custom fallback");
    });

    test("should not use fallback when a valid error can be extracted", () => {
      const fallback = new Error("Custom fallback");
      const error = getError({ message: "Real error" }, fallback);

      assert.notStrictEqual(error, fallback);
      assert.strictEqual(error.message, "Real error");
    });
  });

  // Promise-related
  describe("promise-related errors", () => {
    test("should handle rejected promises in async functions", async () => {
      try {
        await Promise.reject({ message: "Promise rejected" });
      } catch (unknown) {
        const error = getError(unknown);
        assert.ok(error instanceof Error);
        assert.strictEqual(error.message, "Promise rejected");
      }
    });
  });

  // Edge cases
  describe("edge cases", () => {
    test("should handle circular references", () => {
      const circular = {};
      circular.self = circular;

      const error = getError(circular);
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Unknown Error");
    });

    test("should handle functions", () => {
      const func = () => {};
      const error = getError(func);

      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, "Unknown Error");
    });
  });
});
