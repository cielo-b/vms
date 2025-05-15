export interface ApiResponse {
  status?: string;
  message?: string;
  success: boolean;
  data?: {} | null;
  token?: string;
  code: number;
}
