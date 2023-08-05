import { Hono } from "hono";
import { login } from "./login";
import { logout } from "./logout";
import { signup } from "./signup";
import { validate } from "./validate";

const authRoute = new Hono();

authRoute.post("/login", async (c) => {
    return login(c);
});

authRoute.post("/signup", async (c) => {
    return signup(c);
});

authRoute.get("/validate", async (c) => {
    return validate(c);
});

authRoute.get("/logout", async (c) => {
    return logout(c);
});

export default authRoute;
