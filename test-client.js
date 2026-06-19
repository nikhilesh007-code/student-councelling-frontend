import { createAuthClient } from "better-auth/react";
const client = createAuthClient({ baseURL: "http://localhost:3000" });
//@ts-ignore
client.resetPassword({ newPassword: "test", token: "test" })
  .then(res => console.log("Response:", res))
  .catch(console.error);
