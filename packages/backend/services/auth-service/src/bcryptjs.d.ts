declare module "bcryptjs" {
  export function compare(data: string, encrypted: string): Promise<boolean>;

  const bcrypt: {
    compare: typeof compare;
  };

  export default bcrypt;
}