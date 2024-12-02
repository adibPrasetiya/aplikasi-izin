import { app } from "./apps/server.js";
import { APP_PORT } from "./conf/constant.js";

app.listen(APP_PORT || 3000, () => {
  console.info(`SERVER RUNNING ON PORT ${APP_PORT || 3000}`);
});
