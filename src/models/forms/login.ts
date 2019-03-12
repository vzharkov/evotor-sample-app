export class Login {
  auth_code_parts: number[] = [];

  autentication_code(): string {
    return `${this.auth_code_parts[0]}${this.auth_code_parts[1]}${this.auth_code_parts[2]}${this.auth_code_parts[3]}`;
  }
}
