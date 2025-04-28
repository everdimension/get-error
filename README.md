# Get-Error

![npm version](https://img.shields.io/npm/v/get-error.svg)
![license](https://img.shields.io/npm/l/get-error.svg)
![bundle size](https://img.shields.io/bundlephobia/minzip/get-error)
![typescript](https://img.shields.io/badge/TypeScript-ready-blue.svg)
![tests](https://github.com/everdimension/get-error/actions/workflows/node.js.yml/badge.svg)

Safely parse anything into an Error instance

## Getting Started

```sh
npm install get-error
```

### Example Usage

```js
import { getError } from "get-error";

try {
  await Promise.reject({ message: "Something went wrong" });
} catch (err) {
  const error = getError(err); // Guaranteed to get an Error instance
  console.error(error.message); // Safely access `.message` property
}
```

That's it!

## Motivation

In JavaScript, even though there is a strong convention to always throw Error instances, it's not mandatory. Technically, any value can be thrown:

```js
try {
  throw "Something went wrong";
} catch (error) {
  console.log(typeof error); // string
}
```

### Throwing Responses

While throwing strings is unlikely, it's quite popular to come across APIs that throw error-like objects or `Response` objects:

```js
try {
  throw new Response("Unauthorized", { status: 401 });
} catch (error) {
  console.log(getError(error).message); // 401
}
```

This is a common practice in [Remix](https://remix.run/docs/en/main/guides/errors)

### JSON-RPC Error Objects

Another popular case is JSON-RPC APIs: https://www.jsonrpc.org/specification#error_object

```js
try {
  throw {
    id: 1,
    jsonrpc: "2.0",
    error: {
      code: -32601,
      message: "Method not found",
      data: null,
    },
  };
} catch (unknownError) {
  // You'd have to do something like `error.error.message`
  const error = getError(unknownError); // returns Error instance and preserves `code` and `data` fields
  console.log(error.message); // "Method not found"
}
```

### Handy in building User Interaces

```jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";

function App() {
  const { data, isError, error } = useQuery({
    queryKey: ["data"],
    queryFn: async () => {
      return Promise.reject(new Response(null, { status: 404 }));
    },
  });

  if (isError) {
    // return <p>{error.message}</p> // ❌ NOT safe!
    return <p>{getError(error).message}</p>; // ✅ Safe!
  }
  return <div>{data}</div>;
}
```
