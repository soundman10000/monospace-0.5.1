import { mapEngineError } from "@monospace/sdk";

const ERROR_BODY = [
  [(body) => body && typeof body === "object" && "message" in body, (body) => body],
  [(body) => typeof body === "string", (body) => ({ message: body })],
  [() => true, () => ({ message: "Request failed" })],
];

export const throwMapped = (response) => {
  const body = response._data;
  const [, toError] = ERROR_BODY.find(([match]) => match(body));
  throw mapEngineError(toError(body), response.status);
};
