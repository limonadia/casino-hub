export interface ApiServiceOptions {
    baseURL?: string;
    defaultHeaders?: Record<string, string>;
  }
  
  export class ApiService {
    protected baseURL: string;
    protected defaultHeaders: Record<string, string>;
  
    constructor(options?: ApiServiceOptions) {
      this.baseURL = options?.baseURL || "http://localhost:8080/api/v1";
      this.defaultHeaders = options?.defaultHeaders || {
        "Content-Type": "application/json",
      };
    }
  
    protected async get<T>(endpoint: string): Promise<T> {
      const res = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: this.defaultHeaders,
      });
      return this.handleResponse<T>(res);
    }
  
    protected async post<T, B>(endpoint: string, body: B): Promise<T> {
      const res = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(res);
    }
  
    protected async put<T, B>(endpoint: string, body: B): Promise<T> {
      const res = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers: this.defaultHeaders,
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(res);
    }
  
    protected async delete<T>(endpoint: string): Promise<T> {
      const res = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: this.defaultHeaders,
      });
      return this.handleResponse<T>(res);
    }
  
    private async handleResponse<T>(res: Response): Promise<T> {
      if (!res.ok) {
        const text = await res.text();
    
        if (res.status === 401) {
          localStorage.removeItem("token");     
          window.location.href = "/";     
        }
    
        throw new Error(`API error ${res.status}: ${text}`);
      }
    
      return res.json();
    }
    
  }
  