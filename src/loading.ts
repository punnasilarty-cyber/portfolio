/**
 * Waits for every task, counting each as it ends (failed ones too), but never longer than `limit` ms:
 * one slow or broken file must not keep a visitor out.
 */
export function settleWithin(tasks: Promise<unknown>[], limit: number, progress: (done: number) => void): Promise<void> {
  let done = 0;
  let timer: ReturnType<typeof setTimeout>;
  const count = () => progress(++done);
  return Promise.race([
    Promise.all(tasks.map((task) => task.then(count, count))),
    new Promise((resolve) => (timer = setTimeout(resolve, limit))),
  ]).then(() => clearTimeout(timer));
}
