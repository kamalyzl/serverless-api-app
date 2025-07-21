export function responseOk(body: any) {
  return {
    statusCode: 200,
    body: JSON.stringify(body),
  };
}

export function responseBadRequest(message: string) {
  return {
    statusCode: 400,
    body: JSON.stringify({ message }),
  };
}

export function responseError(message: string) {
  return {
    statusCode: 500,
    body: JSON.stringify({ message }),
  };
} 