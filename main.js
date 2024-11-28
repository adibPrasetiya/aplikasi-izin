import { app } from "./src/apps/server.js";
import { APP_PORT } from "./src/conf/constant.js";

app.listen(APP_PORT || 3000, () => {
  console.log(`APP LISTENING ON PORT ${APP_PORT || 3000}`);
});
