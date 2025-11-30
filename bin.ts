import cluster from "cluster";
import os from "os";
import { app } from "./index";

const cpu_count = os.cpus().length;
if (cluster.isPrimary) {
  console.log("this is master with pid", process.pid);
  for (let count = 0; count < cpu_count; count++) {
    const worker = cluster.fork();
    console.log("worker started with pid", worker.process.pid);
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  app.listen(3000, () => console.log("listening.."));
}
