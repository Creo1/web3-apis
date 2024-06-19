export class SuccessResponse {
  statusCode: number;
  status: string;
  message: string;
  data: unknown;
}

export class QueryParams {
  page: number;
  limit: number;
  sort: string;
  filters: string;
  textSearch: string;
}
